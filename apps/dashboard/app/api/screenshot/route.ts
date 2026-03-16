import * as fs from 'fs'
import * as path from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file') ?? ''

  // Security: only allow simple filenames, no path traversal
  if (!file || file.includes('..') || file.includes('/') || file.includes('\\')) {
    return new Response('invalid file', { status: 400 })
  }

  const screenshotDir = path.join(process.cwd(), '.glos', 'screenshots')
  const filePath = path.join(screenshotDir, file)

  if (!fs.existsSync(filePath)) {
    return new Response('not found', { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
