import * as fs from 'fs'
import * as path from 'path'
import type { QualityScore, QualityReport, ContextFile } from './types'

export function calculateQualityReport(
  messagesDir: string,
  locales: string[],
  contextData?: ContextFile | null
): QualityReport {
  const scores: QualityScore[] = []

  // Load English source for "source_en" field
  let sourceEn: Record<string, string> = {}
  try {
    const enPath = path.join(messagesDir, 'en.json')
    if (fs.existsSync(enPath)) {
      sourceEn = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
    }
  } catch {}

  // First pass: collect all keys from context.json that should be translated
  const contextKeys = new Set<string>()
  if (contextData?.keys) {
    for (const [key, context] of Object.entries(contextData.keys)) {
      if (context.occurrences && context.occurrences.length > 0) {
        contextKeys.add(key)
      }
    }
  }

  // Second pass: process each locale
  for (const locale of locales) {
    const beforePath = path.join(messagesDir, `${locale}.before.json`)
    const afterPath = path.join(messagesDir, `${locale}.json`)

    let before: Record<string, string> = {}
    let after: Record<string, string> = {}

    if (fs.existsSync(beforePath)) {
      try { before = JSON.parse(fs.readFileSync(beforePath, 'utf-8')) } catch {}
    }
    if (fs.existsSync(afterPath)) {
      try { after = JSON.parse(fs.readFileSync(afterPath, 'utf-8')) } catch {}
    }

    // Process keys that have translations (existing logic)
    for (const key of Object.keys(after)) {
      if (!before[key] || before[key] === after[key]) continue
      const beforeLen = before[key].length
      const afterLen = after[key].length
      const improvement = beforeLen > 0
        ? Math.min(Math.round(((afterLen - beforeLen) / beforeLen) * 100), 55)
        : 0

      // Build context hint from context data
      let context_hint = ''
      if (contextData?.keys?.[key]) {
        const occs = contextData.keys[key].occurrences
        if (occs?.length === 1) {
          const o = occs[0]
          context_hint = `${o.element_type} · ${o.page_section} · tone: ${o.tone}`
        } else if (occs?.length > 1) {
          context_hint = `${occs.length} occurrences across routes`
        }
      }

      scores.push({
        key,
        route: 'unknown',
        locale,
        source_en: sourceEn[key] ?? key,
        before: before[key],
        after: after[key],
        context_hint,
        improvement_percent: Math.max(improvement, 0)
      })
    }

    // NEW: Add untranslated keys from context.json as 0% quality
    for (const key of contextKeys) {
      // Skip if already has translation
      if (after[key]) continue
      
      // Add as "not yet translated" with 0% score
      scores.push({
        key,
        route: contextData?.keys?.[key]?.occurrences?.[0]?.route ?? 'unknown',
        locale,
        source_en: sourceEn[key] ?? key,
        before: '',
        after: '(not translated)',
        context_hint: contextData?.keys?.[key]?.occurrences?.[0]?.element_type ?? 'unknown',
        improvement_percent: 0
      })
    }
  }

  // Group average by locale
  const by_locale: Record<string, number> = {}
  for (const locale of locales) {
    const localeScores = scores.filter(s => s.locale === locale)
    if (localeScores.length > 0) {
      by_locale[locale] = Math.round(
        localeScores.reduce((sum, s) => sum + s.improvement_percent, 0) / localeScores.length
      )
    }
  }

  const average_improvement = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.improvement_percent, 0) / scores.length)
    : 0

  return {
    scores: scores.sort((a, b) => b.improvement_percent - a.improvement_percent),
    average_improvement,
    by_locale,
    total_keys: scores.length
  }
}
