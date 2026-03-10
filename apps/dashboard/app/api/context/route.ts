import { NextResponse } from 'next/server'
import { readContextFile } from '@/lib/context-reader'

export async function GET() {
  const context = readContextFile()
  if (!context) {
    return NextResponse.json(
      { error: 'No context file found. Run: glos capture --url http://localhost:3001' },
      { status: 404 }
    )
  }
  return NextResponse.json(context)
}
