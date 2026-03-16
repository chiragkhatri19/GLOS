import type { VisionAnalysisResult, ContextFile, KeyContext, ScreenshotResult } from './types'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { VisionElement } from './vision'
import * as fs from 'fs'
import * as path from 'path'

export async function buildContextFile(
  allElements: VisionElement[],
  appUrl: string,
  localeMessages: Record<string, string>
): Promise<ContextFile> {
  // Enrich — always reassign back to same variable
  let elementsToMatch: VisionElement[] = allElements;
  try {
    elementsToMatch = await enrichElements(allElements);
  } catch (err: any) {
    console.warn('[context] Enrichment failed:', err.message);
    elementsToMatch = allElements.map(el => ({
      ...el, tone: 'neutral', ambiguity_score: 5
    }));
  }

  // Load en.json — try all possible paths
  const candidates = [
    path.resolve(process.cwd(), 'apps/demo/messages/en.json'),
    path.resolve(process.cwd(), '../demo/messages/en.json'),
    path.resolve(process.cwd(), '../../apps/demo/messages/en.json'),
    path.resolve(__dirname, '../../../../apps/demo/messages/en.json'),
  ]
  const enJsonPath = candidates.find(p => fs.existsSync(p))
  if (!enJsonPath) {
    console.error('[glos context] FATAL: en.json not found in any candidate path')
    console.error('[glos context] Tried:', candidates)
    return { generated: new Date().toISOString(), app_url: appUrl, routes_analyzed: 0, keys_mapped: 0, keys: {} }
  }

  const enMessages: Record<string, string> = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'))

  // Aggressive normalization — handles all variations
  const normalize = (s: string): string => {
    if (!s || typeof s !== 'string') return '';
    return s
      .toLowerCase()
      .trim()
      .replace(/_/g, ' ')        // save_changes → save changes
      .replace(/-/g, ' ')        // save-changes → save changes
      .replace(/[^\w\s]/g, '')   // strip punctuation
      .replace(/\s+/g, ' ')      // collapse spaces
      .trim();
  }

  // Build lookup from BOTH en.json values AND key names
  const valueToKey = new Map<string, string>()
  for (const [key, value] of Object.entries(enMessages)) {
    if (typeof value === 'string') {
      valueToKey.set(normalize(value), key);   // "save changes" → save_changes
      valueToKey.set(normalize(key), key);     // "save changes" → save_changes
    }
  }

  // Match each extracted element against en.json VALUES (not key names)
  const contextMap: Record<string, any> = {}

  // Matching loop — MUST use elementsToMatch
  for (const element of elementsToMatch) {
    // Handle every possible shape Gemini might return - cast to any for flexibility
    const el = element as any;
    const rawText = 
      el?.text ||           // standard field
      el?.value ||          // alternate field name
      el?.content ||        // another alternate
      el?.string ||         // another alternate
      '';
      
    if (!rawText || typeof rawText !== 'string') continue;
    
    const normalized = normalize(rawText);
    if (!normalized || normalized.length < 2) continue;
    
    // Direct match
    let matchedKey = valueToKey.get(normalized);
    
    // Partial match fallback — if extracted text CONTAINS an en.json value
    if (!matchedKey) {
      for (const [lookupNorm, key] of valueToKey.entries()) {
        if (lookupNorm.length >= 3 && normalized.includes(lookupNorm)) {
          matchedKey = key;
          break;
        }
      }
    }
    
    if (!matchedKey) continue;
    
    if (!contextMap[matchedKey]) {
      contextMap[matchedKey] = {
        key: matchedKey,
        value: enMessages[matchedKey],
        tone: el?.tone || 'neutral',
        ambiguity_score: el?.ambiguity_score || 5,
        occurrences: [],
      };
    }
    
    contextMap[matchedKey].occurrences.push({
      route: el?.route || 'unknown',
      element_type: el?.element_type || 'span',
      page_section: el?.page_section || 'main',
      screenshot: (el?.route || 'unknown')
        .replace(/^\/en\//, '/')
        .replace(/^\//, '')
        .replace(/\//g, '-') + '.png',
    });
  }

  const matchedKeys = Object.values(contextMap);

  // Convert to KeyContext format
  const keys: Record<string, KeyContext> = {}
  for (const item of matchedKeys) {
    keys[item.key] = {
      occurrences: item.occurrences.map((o: any) => ({
        route: o.route,
        element_type: o.element_type,
        tone: item.tone,
        context: `${o.element_type} in ${o.page_section}`,
        nearby_elements: [],
        page_section: o.page_section,
        max_length_estimate: undefined
      }))
    }
  }

  return {
    generated: new Date().toISOString(),
    app_url: appUrl,
    routes_analyzed: elementsToMatch.length,
    keys_mapped: Object.keys(keys).length,
    keys
  }
}

/**
 * Enrich all extracted elements with tone and ambiguity scores using ONE Gemini text call
 */
export async function enrichElements(
  elements: VisionElement[]
): Promise<VisionElement[]> {
  if (elements.length === 0) {
    return elements.map(el => ({ ...el, tone: 'neutral', ambiguity_score: 5 }));
  }
  
  if (!process.env.GEMINI_API_KEY) {
    return elements.map(el => ({ ...el, tone: 'neutral', ambiguity_score: 5 }));
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are analyzing UI text strings from a web application for translation purposes.

For each item in the array below, add two fields:
- "tone": one of: neutral, formal, casual, destructive, positive, warning
- "ambiguity_score": integer 1-10. How hard is this string to translate correctly WITHOUT knowing its UI context? 10 = extremely ambiguous (e.g. "Save" could mean save-to-disk or save-a-life), 1 = completely unambiguous.

Return ONLY a valid JSON array. No markdown, no explanation, no backticks.

${JSON.stringify(elements.map(({ text, element_type, page_section, route }) => ({ text, element_type, page_section, route })))}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const enriched: any[] = JSON.parse(raw)
    
    // CRITICAL: Merge enrichment back into originals by INDEX
    // Original elements are source of truth — NEVER overwrite text or route
    return elements.map((original, i) => {
      const enrichedItem = enriched[i] || {};
      return {
        ...original,                              // keep ALL original fields
        tone: enrichedItem.tone || 'neutral',     // only add new fields
        ambiguity_score: enrichedItem.ambiguity_score || 5,
        // explicitly preserve original text and route — never overwrite
        text: original.text,
        route: original.route,
      };
    });
  } catch (e) {
    return elements.map(el => ({ ...el, tone: 'neutral', ambiguity_score: 5 }))
  }
}
