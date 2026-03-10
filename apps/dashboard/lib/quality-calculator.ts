import * as fs from 'fs'
import * as path from 'path'
import type { QualityScore, QualityReport } from './types'

export function calculateQualityReport(
  messagesDir: string,
  locales: string[]
): QualityReport {
  const scores: QualityScore[] = []

  for (const locale of locales) {
    const beforePath = path.join(messagesDir, `${locale}.before.json`)
    const afterPath = path.join(messagesDir, `${locale}.json`)

    if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) continue

    let before: Record<string, string>
    let after: Record<string, string>

    try {
      before = JSON.parse(fs.readFileSync(beforePath, 'utf-8'))
      after = JSON.parse(fs.readFileSync(afterPath, 'utf-8'))
    } catch { continue }

    for (const key of Object.keys(after)) {
      if (!before[key] || before[key] === after[key]) continue
      const beforeLen = before[key].length
      const afterLen = after[key].length
      const improvement = beforeLen > 0
        ? Math.min(Math.round(((afterLen - beforeLen) / beforeLen) * 100), 55)
        : 0

      scores.push({
        key,
        route: 'unknown',
        locale,
        before: before[key],
        after: after[key],
        improvement_percent: Math.max(improvement, 0)
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
