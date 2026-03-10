import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import { withRateLimit } from './rate-limiter'
import type { VisionAnalysisResult, TextElement } from './types'

const VISION_PROMPT = `You are analyzing a UI screenshot to extract context for better AI-powered localization.

For every visible UI text element (buttons, labels, headings, nav items, placeholders, badges):
1. Extract the exact text string
2. element_type: button | heading | nav-label | label | placeholder | badge | toast | tooltip
3. tone: formal | casual | urgent | neutral | destructive
4. ONE sentence: what does this element do and where does it appear?
5. nearby_elements: 2-3 nearby UI elements that give this text meaning
6. page_section: header | sidebar | form | footer | modal | danger-zone | main-content
7. is_ui_string: true for UI copy, false for user-generated content
8. max_length_estimate: character limit if element is constrained

FLAG destructive tone for: delete, remove, cancel subscription, reset, revoke
FLAG formal tone for: pay, purchase, subscribe, confirm order, upgrade
SKIP: usernames, emails, dynamic data, decorative icons

Return ONLY raw JSON, no markdown, no backticks:
{"elements": [{"text": "Save","element_type": "button","tone": "casual","context": "Primary action button in profile settings form","nearby_elements": ["Cancel","Profile Settings","Email input"],"page_section": "form-footer","is_ui_string": true,"max_length_estimate": 20}]}`

export async function analyzeScreenshot(
  screenshotPath: string,
  route: string,
  apiKey: string
): Promise<VisionAnalysisResult> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  })

  const imageData = fs.readFileSync(screenshotPath)
  const base64Image = imageData.toString('base64')

  try {
    const result = await withRateLimit(() =>
      model.generateContent([
        { inlineData: { data: base64Image, mimeType: 'image/png' } },
        VISION_PROMPT
      ])
    )
    const cleaned = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return { route, elements: (parsed.elements as TextElement[]).filter(e => e.is_ui_string) }
  } catch (err: any) {
    console.warn(`  ⚠ Vision failed for ${route}: ${err.message}`)
    return { route, elements: [] }
  }
}
