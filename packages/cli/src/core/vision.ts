import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import sharp from 'sharp';

export interface VisionElement {
  text: string;
  element_type: string;
  page_section: string;
  route: string;
  tone?: string;
  ambiguity_score?: number;
}

export interface ScreenshotInput {
  screenshotPath: string;
  route: string;
}

const PROMPT = `You are an elite Senior Frontend Architect and UI/UX Specialist. 
Your task is to perform an exhaustive audit of the provided composite image, which contains multiple web pages stitched vertically.

Each page in the image is preceded by a dark header bar indicating the "PAGE: /route".

For every page section, you must extract ALL static and interactive text elements. 
Think like a developer: look for component identifiers, labels, buttons, and semantic layout patterns.

### Element Extraction Strategy:
1. **Interactive Elements**: All buttons (primary, secondary, ghost), links, tabs, and navigation items.
2. **Structural Content**: Semantic headings (h1-h4), section labels, and card titles.
3. **Data/Status**: Badges, status indicators, and form field placeholders.
4. **Context**: Note the "page_section" (Header, Sidebar, Main, Footer, Modal) where each element resides.

### Response Requirements:
- Return ONLY a valid JSON array.
- No conversational text, no markdowns, no backticks.
- For each object:
  - "text": The literal visible string.
  - "element_type": button | link | heading | nav_item | badge | tab | input_placeholder | text_content
  - "page_section": The UI region (header | sidebar | main | footer | modal | dialog)
  - "route": The literal route from the closest "PAGE: " header above the element.
  - "tone": (Optional) Infer tone of the text: "professional", "casual", "urgent", or "instructive".

### Precision Guidelines:
- Capture short action words (Save, Next, Mark as Done, etc.) with absolute priority.
- If a string is duplicated (e.g., "Dashboard" in header and sidebar), capture BOTH with correct page_section.

BEGIN Extraction:`;

const CONFIG: GenerationConfig = {
  maxOutputTokens: 8192,
  temperature: 0,
  topP: 0.1,
  responseMimeType: 'application/json',
};

// Fallback chain of Gemini API keys for reliability (5 keys × 20 requests = 100 requests/day)
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean) as string[];

export async function analyzeAllScreenshots(
  inputs: ScreenshotInput[],
  keyIndex: number = 0
): Promise<VisionElement[]> {
  if (inputs.length === 0) {
    return [];
  }
  if (!GEMINI_API_KEYS[keyIndex]) {
    console.error('[vision] No API key available at index', keyIndex);
    return [];
  }

  // Filter to existing files only
  const valid = inputs.filter(i => fs.existsSync(i.screenshotPath));
  
  if (valid.length === 0) {
    console.error('[vision] ⚠️ NO VALID SCREENSHOTS!');
    return [];
  }
  
  return await processBatch(valid, keyIndex);
}

async function processBatch(inputs: ScreenshotInput[], batchKeyIndex: number = 0): Promise<VisionElement[]> {
  try {
    const pageWidth = 1200;
    const sections: Buffer[] = [];

    for (const input of inputs) {
      // 1. ADD HEADER LABEL SVG (High contrast, clearly readable)
      const labelSvg = `
        <svg width="${pageWidth}" height="60" xmlns="http://www.w3.org/2000/svg">
          <rect width="${pageWidth}" height="60" fill="#0f172a"/>
          <text x="30" y="38" font-family="monospace" font-size="28" 
                font-weight="bold" fill="#818cf8">
            PAGE: ${input.route}
          </text>
        </svg>`;
      const labelBuffer = Buffer.from(labelSvg);
      sections.push(await sharp(labelBuffer).png().toBuffer());

      // 2. ADD SEPARATOR (10px deep blue line to distinct from screenshot)
      const separatorSvg = `<svg width="${pageWidth}" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1e1b4b"/></svg>`;
      sections.push(await sharp(Buffer.from(separatorSvg)).png().toBuffer());

      // 3. ADD SCREENSHOT (Resized to match width)
      if (!fs.existsSync(input.screenshotPath)) {
        console.error(`[processBatch] ⚠️ Screenshot missing: ${input.screenshotPath}`);
        continue;
      }
      
      const resized = await sharp(input.screenshotPath)
        .resize({ width: pageWidth, fit: 'contain' })
        .jpeg({ quality: 75 })
        .toBuffer();
      
      sections.push(await sharp(resized).png().toBuffer());
    }

    // Get dimensions of each section
    const sectionMetas = await Promise.all(
      sections.map(buf => sharp(buf).metadata())
    );

    const totalHeight = sectionMetas.reduce((sum, m) => sum + (m.height || 0), 0);
    const maxWidth = Math.max(...sectionMetas.map(m => m.width || 0));

    // Composite all sections vertically
    let yOffset = 0;
    const compositeInputs = sections.map((buf, i) => {
      const item = { input: buf, top: yOffset, left: 0 };
      yOffset += sectionMetas[i].height || 0;
      return item;
    });

    const stitched = await sharp({
      create: {
        width: maxWidth,
        height: totalHeight,
        channels: 3,
        background: { r: 10, g: 10, b: 20 },
      },
    })
      .composite(compositeInputs)
      .jpeg({ quality: 65 })
      .toBuffer();

    const base64 = stitched.toString('base64');

    // Try each API key in fallback chain until one succeeds
    let lastError: Error | null = null;
    
    for (let keyIndex = 0; keyIndex < GEMINI_API_KEYS.length; keyIndex++) {
      const apiKey = GEMINI_API_KEYS[keyIndex];
      
      if (!apiKey) {
        continue;
      }
      
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: CONFIG,
        });

        const result = await model.generateContent([
          { text: PROMPT },
          { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        ]);

        const raw = result.response.text();

        // Clean response - remove markdown code blocks
        const cleaned = raw
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/i, '')
          .trim();

        // FIX 2: Find the FIRST complete JSON array using bracket matching
        const jsonStart = cleaned.indexOf('[');
        if (jsonStart === -1) {
          // If this was the last key, return empty
          if (keyIndex === GEMINI_API_KEYS.length - 1) {
            return [];
          }
          
          // Otherwise, continue to next key
          continue;
        }

        // Walk forward to find the matching closing bracket
        let depth = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < cleaned.length; i++) {
          if (cleaned[i] === '[') depth++;
          else if (cleaned[i] === ']') {
            depth--;
            if (depth === 0) {
              jsonEnd = i;
              break;
            }
          }
        }

        if (jsonEnd === -1) {
          // If this was the last key, return empty
          if (keyIndex === GEMINI_API_KEYS.length - 1) {
            return [];
          }
          
          // Otherwise, continue to next key
          continue;
        }

        const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

        try {
          const parsed = JSON.parse(jsonString) as any[];
          
          const elements: VisionElement[] = parsed
            .filter(e => typeof e.text === 'string' && e.text.trim().length > 0)
            .map(e => ({
              text: e.text.trim(),
              element_type: e.element_type || 'button',
              page_section: e.page_section || 'main',
              route: e.route || inputs[0].route,
            }));

          return elements;
        } catch (parseErr) {
          // If parse fails and this was the last key, return empty
          if (keyIndex === GEMINI_API_KEYS.length - 1) {
            return [];
          }
          
          // Otherwise, continue to next key
          continue;
        }

      } catch (err: any) {
        lastError = err;
        
        // If this was the last key, return empty
        if (keyIndex === GEMINI_API_KEYS.length - 1) {
          return [];
        }
        
        // Otherwise, continue to next key
      }
    }
    
    // Should never reach here, but just in case
    return [];

  } catch (err: any) {
    return [];
  }
}
