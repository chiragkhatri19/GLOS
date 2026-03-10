import type { VisionAnalysisResult, ContextFile, KeyContext } from './types'

export function buildContextFile(
  visionResults: VisionAnalysisResult[],
  appUrl: string,
  localeMessages: Record<string, string>
): ContextFile {
  const keys: Record<string, KeyContext> = {}

  for (const result of visionResults) {
    for (const element of result.elements) {
      const matchingKey = findKeyForText(element.text, localeMessages)
      if (!matchingKey) continue
      if (!keys[matchingKey]) keys[matchingKey] = { occurrences: [] }
      const isDuplicate = keys[matchingKey].occurrences.some(
        o => o.route === result.route && o.context === element.context
      )
      if (!isDuplicate) {
        keys[matchingKey].occurrences.push({
          route: result.route,
          element_type: element.element_type,
          tone: element.tone,
          context: element.context,
          nearby_elements: element.nearby_elements,
          page_section: element.page_section,
          max_length_estimate: element.max_length_estimate
        })
      }
    }
  }

  return {
    generated: new Date().toISOString(),
    app_url: appUrl,
    routes_analyzed: visionResults.length,
    keys_mapped: Object.keys(keys).length,
    keys
  }
}

function findKeyForText(text: string, messages: Record<string, string>): string | null {
  const norm = text.toLowerCase().trim()
  for (const [k, v] of Object.entries(messages)) {
    if (v.toLowerCase().trim() === norm) return k
  }
  for (const [k, v] of Object.entries(messages)) {
    const vn = v.toLowerCase().trim()
    if ((vn.includes(norm) || norm.includes(vn)) && norm.length > 3 && vn.length > 3) return k
  }
  return null
}
