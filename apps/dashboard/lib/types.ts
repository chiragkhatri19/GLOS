export interface ContextFile {
  generated: string
  app_url: string
  routes_analyzed: number
  keys_mapped: number
  keys: Record<string, {
    occurrences: {
      route: string
      element_type: string
      tone: string
      context: string
      nearby_elements: string[]
      page_section: string
      max_length_estimate?: number
    }[]
  }>
}

export interface QualityScore {
  key: string
  route: string
  locale: string
  before: string
  after: string
  improvement_percent: number
}

export interface QualityReport {
  scores: QualityScore[]
  average_improvement: number
  by_locale: Record<string, number>
  total_keys: number
}

export interface CaptureRequest {
  url: string
  routes?: string[]
}

export interface CaptureResponse {
  success: boolean
  routes_analyzed: number
  keys_mapped: number
  error?: string
}

export interface TranslateRequest {
  locales: string[]
  messagesDir?: string
}

export interface TranslateResponse {
  success: boolean
  locales_translated: string[]
  error?: string
}
