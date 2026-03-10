import * as fs from 'fs'
import * as path from 'path'
import type { ContextFile } from './types'

export interface TranslationOptions {
  contextFile: string
  locales: string[]
  messagesDir: string
  apiKey: string
}

export async function translateWithContext(options: TranslationOptions): Promise<void> {
  const { contextFile, locales, messagesDir, apiKey } = options
  const context: ContextFile = JSON.parse(fs.readFileSync(contextFile, 'utf-8'))
  const sourceMessages: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8')
  )

  // Placeholder for LingoDotDevEngine - would need actual SDK
  // For now, just export enriched messages for manual translation
  for (const locale of locales) {
    console.log(`\n🌍 Preparing translation for ${locale}...`)
    const enriched: Record<string, string> = {}

    for (const [key, value] of Object.entries(sourceMessages)) {
      const ctx = context.keys[key]
      enriched[key] = value
      if (ctx?.occurrences?.length) {
        if (ctx.occurrences.length === 1) {
          const o = ctx.occurrences[0]
          enriched[`${key}___hint`] =
            `TRANSLATOR NOTE: This is a ${o.element_type} in ${o.page_section}. ` +
            `${o.context}. Tone: ${o.tone}. Near: ${o.nearby_elements.join(', ')}. ` +
            `Do NOT translate generically.`
        } else {
          ctx.occurrences.forEach((o, i) => {
            enriched[`${key}___ctx${i}`] =
              `CONTEXT ${i + 1} on ${o.route}: ${o.element_type} | tone:${o.tone} | ${o.context}`
          })
        }
      }
    }

    fs.writeFileSync(path.join(messagesDir, `${locale}.enriched.json`), JSON.stringify(enriched, null, 2))
    console.log(`  ✅ ${locale}.enriched.json saved`)
  }
}
