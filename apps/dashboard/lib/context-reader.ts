import * as fs from 'fs'
import * as path from 'path'
import type { ContextFile } from './types'

// Resolves context file from multiple possible locations
function resolveContextPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'glos.context.json'),             // apps/dashboard/glos.context.json
    path.join(process.cwd(), '../../glos.context.json'),       // monorepo root
    path.join(process.cwd(), '../../../glos.context.json'),    // one level higher
    path.join(process.cwd(), 'apps/dashboard/glos.context.json'),
    path.join(process.cwd(), '../apps/dashboard/glos.context.json'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

export function readContextFile(): ContextFile | null {
  const p = resolveContextPath()
  if (!p) return null
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf-8'))
    
    // Handle all three possible formats defensively
    if (Array.isArray(raw)) {
      // Format A: direct array of { key, value, tone, occurrences }
      // Convert to ContextFile format
      return {
        generated: new Date().toISOString(),
        app_url: '',
        routes_analyzed: 0,
        keys_mapped: raw.length,
        keys: raw.reduce((acc: any, item: any) => {
          acc[item.key] = {
            occurrences: item.occurrences || []
          }
          return acc
        }, {})
      }
    } else if (raw.keys && typeof raw.keys === 'object' && !Array.isArray(raw.keys)) {
      // Format B: { keys: { "save": { occurrences: [...] } } } — correct format
      return raw as ContextFile
    } else if (raw.elements && Array.isArray(raw.elements)) {
      // Format C: { elements: [...] }
      // Convert to ContextFile format
      return {
        generated: new Date().toISOString(),
        app_url: raw.app_url || '',
        routes_analyzed: raw.routes_analyzed || 0,
        keys_mapped: raw.elements.length,
        keys: raw.elements.reduce((acc: any, item: any) => {
          acc[item.key] = {
            occurrences: item.occurrences || []
          }
          return acc
        }, {})
      }
    }
    
    // Fallback: try to cast as ContextFile
    return raw as ContextFile
  } catch {
    return null
  }
}

export function resolveMessagesDir(): string | null {
  const candidates = [
    path.join(process.cwd(), '../../apps/demo/messages'),
    path.join(process.cwd(), '../demo/messages'),
    path.join(process.cwd(), 'messages'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}
