import * as fs from 'fs'
import * as path from 'path'
import type { QualityScore } from './types'

export function compareTranslations(messagesDir: string, locales: string[]): QualityScore[] {
  const scores: QualityScore[] = []
  for (const locale of locales) {
    const beforePath = path.join(messagesDir, `${locale}.before.json`)
    const afterPath = path.join(messagesDir, `${locale}.json`)
    if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) continue
    const before: Record<string, string> = JSON.parse(fs.readFileSync(beforePath, 'utf-8'))
    const after: Record<string, string> = JSON.parse(fs.readFileSync(afterPath, 'utf-8'))
    for (const key of Object.keys(after)) {
      if (!before[key] || before[key] === after[key]) continue
      const improvement = before[key].length > 0
        ? Math.min(Math.round(((after[key].length - before[key].length) / before[key].length) * 100), 50)
        : 0
      scores.push({ key, route: 'unknown', locale, before: before[key], after: after[key], improvement_percent: Math.max(improvement, 0) })
    }
  }
  return scores.sort((a, b) => b.improvement_percent - a.improvement_percent)
}
