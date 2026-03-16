import * as fs from 'fs'
import * as path from 'path'
import Bottleneck from 'bottleneck'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ContextFile } from './types'

export interface TranslationOptions {
  contextFile: string
  locales: string[]
  messagesDir: string
  apiKey: string       // Gemini API key
}

const LOCALE_NAMES: Record<string, string> = {
  ja: 'Japanese', de: 'German', ar: 'Arabic', fr: 'French', es: 'Spanish',
  pt: 'Portuguese', it: 'Italian', ko: 'Korean', zh: 'Chinese (Simplified)',
}

function localeName(locale: string): string {
  return LOCALE_NAMES[locale] ?? locale
}

// Dedicated translation rate limiter — uses gemini-2.5-flash (15 RPM quota).
// 4200ms spacing → max ~14.3 RPM, safely under the 15 RPM free-tier limit.
// Kept separate from vision's limiter so capture and translate don't block each other.
const translateLimiter = new Bottleneck({ minTime: 4200, maxConcurrent: 1 })

// Translation model fallback chain — each model has its own separate free-tier quota bucket.
// If one model's daily limit is exhausted, the next is tried automatically.
const TRANSLATE_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']

/** Sleep for ms milliseconds */
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

/** Parse the retry delay (in ms) from a 429 error message, e.g. "retryDelay":"40s" or "Please retry in 40.3s" */
function parseRetryDelay(message: string): number {
  // JSON field: "retryDelay":"40s" or "retryDelay":"1.5m"
  const jsonMatch = message.match(/"retryDelay"\s*:\s*"([0-9.]+)([sm])"/)
  if (jsonMatch) {
    const val = parseFloat(jsonMatch[1])
    return jsonMatch[2] === 'm' ? val * 60_000 : val * 1_000
  }
  // Plain text: "Please retry in 40.28s" or "retry in 40s"
  const textMatch = message.match(/retry\s+in\s+([0-9.]+)\s*s/i)
  if (textMatch) return parseFloat(textMatch[1]) * 1_000
  return 45_000 // conservative default
}

/** Extract the first complete JSON object from a string robustly. */
function extractJson(text: string): Record<string, string> {
  // Fast path: the whole string is clean JSON
  try { return JSON.parse(text) } catch {}

  // Strip markdown code fences
  const stripped = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(stripped) } catch {}

  // Find outermost { … } block
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try { return JSON.parse(stripped.slice(start, end + 1)) } catch {}
  }

  throw new Error(`Could not parse JSON from Gemini response. Raw: ${text.slice(0, 200)}`)
}

/** Call Gemini to batch-translate a flat key→value record. Returns translated key→value. */
async function geminiTranslate(
  genAI: GoogleGenerativeAI,
  locale: string,
  messages: Record<string, string>,
  contextHints: Record<string, string>,
  modelIndex = 0,
  attempt = 1
): Promise<Record<string, string>> {
  if (modelIndex >= TRANSLATE_MODELS.length) {
    throw new Error(`All translation models exhausted (tried ${TRANSLATE_MODELS.join(', ')}). Daily quota may be fully used.`)
  }

  const modelName = TRANSLATE_MODELS[modelIndex]
  // gemini-2.5-flash: stable, 15 RPM free tier — safe for multi-locale batch translation.
  // gemini-2.5-flash is reserved for vision analysis where model quality matters most.
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json' },
  })

  const hasContext = Object.keys(contextHints).length > 0
  const lang = localeName(locale)

  const entries = Object.entries(messages)
    .map(([k, v]) => {
      const hint = contextHints[k]
      // Escape quotes in values/hints to keep the inline comment valid
      const safeV = v.replace(/"/g, '\\"')
      return hint
        ? `"${k}": "${safeV}"  // ${hint.replace(/\n/g, ' ')}`
        : `"${k}": "${safeV}"`
    })
    .join('\n')

  const prompt = hasContext
    ? `You are a professional UI/UX translator. Translate the following English UI strings to ${lang}.
Use the inline context comments (// ...) to produce accurate, context-aware translations.
Return ONLY a raw JSON object mapping each key to its translated string.
Do NOT include the context comments in the output. Do NOT add extra keys.
Translate values only; keep the keys exactly as-is.

Strings to translate:
{
${entries}
}`
    : `You are a professional translator. Translate the following English UI strings to ${lang}.
Return ONLY a raw JSON object mapping each key to its translated string.
Do NOT add extra keys. Translate values only; keep the keys exactly as-is.

Strings to translate:
{
${entries}
}`

  try {
    const result = await translateLimiter.schedule(() => model.generateContent(prompt))
    const raw = result.response.text()
    return extractJson(raw)
  } catch (err: any) {
    const msg: string = err?.message ?? ''
    const is429 = msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate')

    if (!is429) throw err // non-quota error — propagate immediately

    const isDaily = msg.toLowerCase().includes('per_day') || msg.toLowerCase().includes('perday') ||
      msg.includes('FreeTier') || (msg.includes('limit: 0') && msg.includes('free_tier'))

    if (isDaily) {
      // Daily quota for this model is gone — try the next model in the chain
      console.warn(`  ⚠ Daily quota exhausted for ${modelName}, falling back to next model...`)
      return geminiTranslate(genAI, locale, messages, contextHints, modelIndex + 1, 1)
    }

    // RPM rate limit — honor the exact retry delay from the error, then retry same model
    if (attempt <= 3) {
      const delay = parseRetryDelay(msg)
      console.warn(`  ⚠ Rate limit on ${modelName} (attempt ${attempt}), retrying in ${Math.round(delay / 1000)}s...`)
      await sleep(delay + 1000) // +1s buffer
      return geminiTranslate(genAI, locale, messages, contextHints, modelIndex, attempt + 1)
    }

    // Exhausted retries on this model — try next
    console.warn(`  ⚠ ${modelName} rate-limited after ${attempt} attempts, falling back...`)
    return geminiTranslate(genAI, locale, messages, contextHints, modelIndex + 1, 1)
  }
}

export async function translateWithContext(options: TranslationOptions): Promise<void> {
  const { contextFile, locales, messagesDir, apiKey } = options

  const contextExists = fs.existsSync(contextFile)
  const context: ContextFile | null = contextExists
    ? JSON.parse(fs.readFileSync(contextFile, 'utf-8'))
    : null

  const sourceMessages: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8')
  )

  const genAI = new GoogleGenerativeAI(apiKey)

  for (const locale of locales) {
    console.log(`\n🌍 Translating to ${localeName(locale)} (${locale})...`)

    // --- Pass 1: blind translation (no context) → {locale}.before.json ---
    console.log(`  ➤ Pass 1: blind translation...`)
    const blindTranslation = await geminiTranslate(genAI, locale, sourceMessages, {})
    fs.writeFileSync(
      path.join(messagesDir, `${locale}.before.json`),
      JSON.stringify(blindTranslation, null, 2)
    )
    console.log(`  ✅ ${locale}.before.json saved (${Object.keys(blindTranslation).length} keys)`)

    // --- Build context hints from glos.context.json ---
    const contextHints: Record<string, string> = {}
    if (context?.keys) {
      for (const [key, val] of Object.entries(context.keys)) {
        const occs = val.occurrences
        if (!occs?.length) continue
        if (occs.length === 1) {
          const o = occs[0]
          contextHints[key] =
            `${o.element_type} in ${o.page_section}, tone: ${o.tone}. ${o.context} Near: ${o.nearby_elements.join(', ')}`
        } else {
          contextHints[key] = occs
            .slice(0, 3)
            .map((o, i) => `[${i + 1}] ${o.element_type}/${o.page_section}/${o.tone}: ${o.context}`)
            .join(' | ')
        }
      }
    }

    // --- Pass 2: context-aware translation → {locale}.json ---
    console.log(`  ➤ Pass 2: context-aware translation (${Object.keys(contextHints).length} hints)...`)
    const contextTranslation = await geminiTranslate(genAI, locale, sourceMessages, contextHints)
    fs.writeFileSync(
      path.join(messagesDir, `${locale}.json`),
      JSON.stringify(contextTranslation, null, 2)
    )
    console.log(`  ✅ ${locale}.json saved (${Object.keys(contextTranslation).length} keys)`)
  }
}
