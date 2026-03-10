import { NextResponse } from 'next/server'
import * as path from 'path'
import { translateWithContext } from '@glos/core'
import { resolveMessagesDir } from '@/lib/context-reader'
import type { TranslateRequest, TranslateResponse } from '@/lib/types'

export async function POST(req: Request) {
  const body: TranslateRequest = await req.json()
  const { locales, messagesDir: customDir } = body

  if (!locales || locales.length === 0) {
    return NextResponse.json({ success: false, error: 'locales array is required' }, { status: 400 })
  }

  const apiKey = process.env.LINGODOTDEV_API_KEY
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'LINGODOTDEV_API_KEY not set' }, { status: 500 })
  }

  const messagesDir = customDir ?? resolveMessagesDir()
  if (!messagesDir) {
    return NextResponse.json({ success: false, error: 'Messages directory not found' }, { status: 404 })
  }

  const contextFile = path.join(process.cwd(), '../../glos.context.json')

  try {
    await translateWithContext({ contextFile, locales, messagesDir, apiKey })
    const response: TranslateResponse = {
      success: true,
      locales_translated: locales
    }
    return NextResponse.json(response)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? 'Translation failed' },
      { status: 500 }
    )
  }
}
