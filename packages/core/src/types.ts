export interface TextElement {
  text: string
  element_type: 'button' | 'heading' | 'nav-label' | 'label' | 'placeholder' | 'badge' | 'toast' | 'tooltip'
  tone: 'formal' | 'casual' | 'urgent' | 'neutral' | 'destructive'
  context: string
  nearby_elements: string[]
  page_section: string
  is_ui_string: boolean
  max_length_estimate?: number
}

export interface ScreenshotResult {
  route: string
  screenshotPath: string
  timestamp: string
}

export interface VisionAnalysisResult {
  route: string
  elements: TextElement[]
}

export interface KeyOccurrence {
  route: string
  element_type: string
  tone: string
  context: string
  nearby_elements: string[]
  page_section: string
  max_length_estimate?: number
}

export interface KeyContext {
  occurrences: KeyOccurrence[]
}

export interface ContextFile {
  generated: string
  app_url: string
  routes_analyzed: number
  keys_mapped: number
  keys: Record<string, KeyContext>
}

export interface QualityScore {
  key: string
  route: string
  locale: string
  before: string
  after: string
  improvement_percent: number
}
