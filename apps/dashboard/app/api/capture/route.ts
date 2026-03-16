import * as fs from 'fs'
import * as path from 'path'

// Detect if we are running on Vercel or any serverless environment
const IS_SERVERLESS = 
  process.env.VERCEL === '1' || 
  process.env.VERCEL_ENV !== undefined ||
  process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

export const maxDuration = 60

export async function POST(req: Request) {
  const body = await req.json()
  const { url, routes } = body

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      try {
        // ─────────────────────────────────────────────────────
        // SERVERLESS MODE (Vercel) — no Playwright available
        // Accept pre-generated context data from the request body
        // User runs CLI locally, pastes result into dashboard
        // ─────────────────────────────────────────────────────
        if (IS_SERVERLESS) {
          emit({ type: 'stage', stage: 'serverless', message: 'Running in cloud mode...' })
          
          const { contextData } = body

          if (contextData) {
            // Context was uploaded directly from CLI output
            emit({ type: 'stage', stage: 'complete', message: 'Context received from CLI' })
            emit({
              type: 'complete',
              routes_analyzed: contextData.routes_analyzed ?? 0,
              keys_mapped: contextData.keys_mapped ?? 0,
            })
          } else {
            // No context data provided — tell user to run CLI
            emit({
              type: 'error',
              message: 'This dashboard is deployed to Vercel. Run the CLI on your local machine first:\n\nnpx @chiragbuilds/glos capture --url http://localhost:3000\n\nThen upload the generated glos.context.json file.',
            })
          }
          controller.close()
          return
        }

        // ─────────────────────────────────────────────────────
        // LOCAL MODE — full Playwright pipeline
        // Everything below is unchanged from original
        // ─────────────────────────────────────────────────────
        
        // Dynamically import @glos/core so Vercel never tries to bundle it
        const { captureApp, buildContextFile, enrichElements } = await import('@glos/core')
        const { resolveMessagesDir } = await import('@/lib/context-reader')

        if (!url) {
          emit({ type: 'error', message: 'url is required' })
          controller.close()
          return
        }
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
          emit({ type: 'error', message: 'GEMINI_API_KEY not set' })
          controller.close()
          return
        }

        // Reachability check
        try {
          const checkUrl = url.replace(/\/$/, '');
          const res = await fetch(checkUrl, { 
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
          });
          console.log(`[capture] Reachability check: ${checkUrl} → ${res.status}`);
        } catch (err: any) {
          if (err.message?.includes('fetch') || err.name === 'TimeoutError' || err.message?.includes('ECONNREFUSED')) {
            emit({
              type: 'error',
              message: `Cannot reach ${url} — make sure your app is running.`
            });
            controller.close();
            return;
          }
          console.warn(`[capture] Reachability check warning:`, err.message);
        }

        // Stage 1 — Screenshots
        emit({ type: 'stage', stage: 'screenshots', message: 'Launching browser...' })

        const baseUrl = url.replace(/\/$/, '')
        const startUrl = baseUrl.includes('localhost:3001') 
          ? `${baseUrl}/en`
          : baseUrl
        
        const screenshots = await captureApp({
          url: startUrl,
          routes,
          onProgress: (event) => {
            if (event.type === 'browser_ready') {
              emit({ type: 'stage', stage: 'screenshots', message: 'Browser ready — capturing pages...' })
            } else if (event.type === 'screenshot_taken') {
              emit({
                type: 'screenshot',
                route: event.route,
                file: path.basename(event.screenshotPath),
                index: event.index,
                total: event.total,
              })
            } else if (event.type === 'screenshot_error') {
              emit({ type: 'screenshot_error', route: event.route, error: event.error, index: event.index, total: event.total })
            }
          },
        })

        // Stage 2 — Enrich elements
        emit({ type: 'stage', stage: 'vision', message: 'Enriching elements with Vision LLM...' })

        let enrichedElements = screenshots.allElements;
        
        try {
          screenshots.screenshots.forEach((ss, idx) => {
            emit({ type: 'vision_start', route: ss.route, index: idx });
          });
          
          enrichedElements = await enrichElements(screenshots.allElements)
          
          screenshots.screenshots.forEach((ss, idx) => {
            const routeElements = enrichedElements.filter(el => el.route === ss.route);
            emit({ type: 'vision_done', route: ss.route, index: idx, elements: routeElements.length });
          });
          
          console.log('[context] Enrichment complete');
        } catch (vErr: any) {
          emit({ type: 'vision_error', route: 'all', error: vErr.message, elements: screenshots.allElements.length })
          enrichedElements = screenshots.allElements.map(el => ({ 
            ...el, 
            tone: 'neutral', 
            ambiguity_score: 5 
          }));
        }

        // Load en.json for key matching
        let messages: Record<string, string> = {}
        const messagesDir = resolveMessagesDir()
        if (messagesDir) {
          const candidates = [
            path.join(messagesDir, 'en.json'),
            path.join(process.cwd(), 'apps/demo/messages/en.json'),
            path.join(process.cwd(), '../demo/messages/en.json'),
            path.join(process.cwd(), '../../apps/demo/messages/en.json'),
          ]
          const enPath = candidates.find(p => fs.existsSync(p))
          if (enPath) {
            messages = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
          }
        }

        console.log('[capture] Calling buildContextFile with', enrichedElements.length, 'elements');

        const contextFile = await buildContextFile(enrichedElements, url, messages)
        
        // Write context file to multiple locations
        const writePaths = [
          path.join(process.cwd(), 'glos.context.json'),
          path.join(process.cwd(), '../../glos.context.json'),
          path.join(process.cwd(), '../../../glos.context.json'),
          path.join(process.cwd(), 'apps/dashboard/glos.context.json'),
          path.join(process.cwd(), '../../apps/dashboard/glos.context.json'),
        ];

        for (const p of writePaths) {
          try {
            fs.writeFileSync(p, JSON.stringify(contextFile, null, 2));
            console.log('[context] Written to:', p);
          } catch {}
        }

        emit({
          type: 'complete',
          routes_analyzed: contextFile.routes_analyzed,
          keys_mapped: contextFile.keys_mapped,
        })

      } catch (err: any) {
        emit({ type: 'error', message: err.message ?? 'Capture failed' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
