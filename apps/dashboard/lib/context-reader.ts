import * as fs from 'fs'
import * as path from 'path'
import type { ContextFile } from './types'

// Resolves context file from multiple possible locations
function resolveContextPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'glos.context.json'),
    path.join(process.cwd(), '../../glos.context.json'),
    path.join(process.cwd(), '../../../glos.context.json'),
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
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as ContextFile
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
