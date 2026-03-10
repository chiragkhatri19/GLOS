import { NextResponse } from 'next/server'
import { calculateQualityReport } from '@/lib/quality-calculator'
import { resolveMessagesDir } from '@/lib/context-reader'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locales = (searchParams.get('locales') ?? 'ja,de,ar').split(',').map(l => l.trim())

  const messagesDir = searchParams.get('dir') ?? resolveMessagesDir()
  if (!messagesDir) {
    return NextResponse.json(
      { error: 'Messages directory not found.' },
      { status: 404 }
    )
  }

  const report = calculateQualityReport(messagesDir, locales)
  return NextResponse.json(report)
}
