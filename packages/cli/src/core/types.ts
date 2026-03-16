export interface DOMElement {
  text: string
  tag: string
  role: string
}

export interface TextElement {
  text: string
  element_type: 'button' | 'heading' | 'label' | 'link' | 'input_placeholder' | 'nav_item' | 'badge' | 'tooltip'
  tone: 'neutral' | 'formal' | 'casual' | 'destructive' | 'positive' | 'warning'
  page_section: string
  // New fields for DOM-based extraction
  tag?: string
  route?: string
}

export interface ScreenshotResult {
  route: string
  screenshotPath: string
  timestamp: string
  domElements?: DOMElement[] // Add DOM elements extracted from this route
}

export interface VisionAnalysisResult {
  route: string
  elements: TextElement[]
  // New: classified elements with context (from Gemini)
  classifiedElements?: TextElement[]
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
