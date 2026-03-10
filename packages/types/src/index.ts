export interface UIElement {
  text: string;
  element_type: 'button' | 'heading' | 'nav-label' | 'label' | 'placeholder' | 'badge' | 'toast' | 'tooltip';
  tone: 'formal' | 'casual' | 'urgent' | 'neutral' | 'destructive';
  context: string;
  nearby_elements: string[];
  page_section: 'header' | 'sidebar' | 'form' | 'footer' | 'modal' | 'danger-zone' | 'main-content';
  is_ui_string: boolean;
  is_destructive?: boolean;
  is_financial?: boolean;
}

export interface VisionAnalysisResult {
  elements: UIElement[];
}

export interface ScreenshotConfig {
  url: string;
  viewport?: { width: number; height: number };
  fullPage?: boolean;
  waitForSelector?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface GlosConfig {
  geminiApiKey: string;
  lingoDevApiKey?: string;
  outputDir?: string;
  model?: string;
}

export interface TranslationContext {
  projectId: string;
  sourceLocale: string;
  targetLocales: string[];
  elements: UIElement[];
}

export interface LingoDevExport {
  keys: Array<{
    key: string;
    sourceText: string;
    context: string;
    elementType: string;
    pageSection: string;
    tone: string;
  }>;
}
