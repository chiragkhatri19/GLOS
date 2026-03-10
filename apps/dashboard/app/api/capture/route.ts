import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { captureApp, analyzeScreenshot, buildContextFile } from '@glos/core'
import { resolveMessagesDir } from '@/lib/context-reader'
import type { CaptureRequest, CaptureResponse } from '@/lib/types'

export async function POST(req: Request) {
  const body: CaptureRequest = await req.json()
  const { url, routes } = body

  if (!url) {
    return NextResponse.json({ success: false, error: 'url is required' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY not set' }, { status: 500 })
  }

  try {
    const screenshots = await captureApp({ url, routes })
    const visionResults = []

    for (const s of screenshots) {
      const result = await analyzeScreenshot(s.screenshotPath, s.route, apiKey)
      visionResults.push(result)
    }

    // Load messages for key matching
    let messages: Record<string, string> = {}
    const messagesDir = resolveMessagesDir()
    if (messagesDir) {
      const enPath = path.join(messagesDir, 'en.json')
      if (fs.existsSync(enPath)) {
        messages = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
      }
    }

    const contextFile = buildContextFile(visionResults, url, messages)

    // Write context file to monorepo root
    const outputPath = path.join(process.cwd(), '../../glos.context.json')
    fs.writeFileSync(outputPath, JSON.stringify(contextFile, null, 2))

    const response: CaptureResponse = {
      success: true,
      routes_analyzed: contextFile.routes_analyzed,
      keys_mapped: contextFile.keys_mapped
    }
    return NextResponse.json(response)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? 'Capture failed' },
      { status: 500 }
    )
  }
}
