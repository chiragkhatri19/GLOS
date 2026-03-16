import { NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { LingoDotDevEngine } from 'lingo.dev/sdk';

const encoder = new TextEncoder();

function emit(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

function findPath(candidates: string[]): string | null {
  return candidates.find(p => fs.existsSync(p)) ?? null;
}

const EN_CANDIDATES = [
  path.join(process.cwd(), 'apps/demo/messages/en.json'),
  path.join(process.cwd(), '../../apps/demo/messages/en.json'),
  path.join(process.cwd(), '../../../apps/demo/messages/en.json'),
];
const MESSAGES_CANDIDATES = [
  path.join(process.cwd(), 'apps/demo/messages'),
  path.join(process.cwd(), '../../apps/demo/messages'),
  path.join(process.cwd(), '../../../apps/demo/messages'),
];
const CONTEXT_CANDIDATES = [
  path.join(process.cwd(), 'glos.context.json'),
  path.join(process.cwd(), 'apps/dashboard/glos.context.json'),
  path.join(process.cwd(), '../../glos.context.json'),
  path.join(process.cwd(), '../../../glos.context.json'),
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const locales: string[] = body.locales ?? [
    'ja','de','ar','fr','es','zh','hi','pt','ko','it'
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── 1. Find files ─────────────────────────────────────────────
        const enPath = findPath(EN_CANDIDATES);
        if (!enPath) {
          emit(controller, { type: 'error', message: 'en.json not found' });
          controller.close();
          return;
        }

        const messagesDir = findPath(MESSAGES_CANDIDATES);
        if (!messagesDir) {
          emit(controller, { type: 'error', message: 'messages directory not found' });
          controller.close();
          return;
        }

        // ── 2. Load English source ────────────────────────────────────
        const enStrings: Record<string, string> = JSON.parse(
          fs.readFileSync(enPath, 'utf-8')
        );
        console.log(`[translate] Loaded ${Object.keys(enStrings).length} English strings`);

        // ── 3. Load context hints from glos.context.json ──────────────
        const contextHints: Record<string, string> = {};
        const contextPath = findPath(CONTEXT_CANDIDATES);

        if (contextPath) {
          try {
            const raw = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
            const keys = raw.keys ?? {};
            for (const [key, data] of Object.entries(keys) as [string, any][]) {
              const occ = data.occurrences?.[0];
              if (occ) {
                const elementType = occ.element_type ?? 'button';
                const route       = occ.route ?? '/';
                const tone        = occ.tone ?? data.tone ?? 'neutral';
                const section     = occ.page_section ?? 'main';
                contextHints[key] = `${elementType} on ${route} in ${section}, tone: ${tone}`;
              }
            }
            console.log(`[translate] Loaded ${Object.keys(contextHints).length} context hints`);
          } catch (e) {
            console.warn('[translate] Context hints load failed:', e);
          }
        } else {
          console.warn('[translate] No glos.context.json found — running without hints');
        }

        // ── 4. Initialize Lingo.dev SDK ───────────────────────────────
        const lingo = new LingoDotDevEngine({
          apiKey: process.env.LINGODOTDEV_API_KEY ?? '',
          batchSize: 25,
          idealBatchItemSize: 250,
        });

        const translated: string[] = [];

        // ── 5. Translate each locale ──────────────────────────────────
        for (const locale of locales) {
          try {
            // ── PASS 1: Blind translation ─────────────────────────────
            emit(controller, { type: 'locale_start', locale, pass: 1 });
            console.log(`[translate] ${locale} Pass 1 — blind (no context)`);

            const blindResult = await lingo.localizeObject(
              enStrings,
              { sourceLocale: 'en', targetLocale: locale },
              (progress: number) => {
                console.log(`[translate] ${locale} P1 progress: ${progress}%`);
              }
            );

            // Save as .before.json for quality comparison
            const beforePath = path.join(messagesDir, `${locale}.before.json`);
            fs.writeFileSync(beforePath, JSON.stringify(blindResult, null, 2));
            console.log(`[translate] ${locale} Pass 1 done — saved to ${locale}.before.json`);

            // ── PASS 2: Context-aware translation ─────────────────────
            emit(controller, { type: 'locale_start', locale, pass: 2 });
            console.log(`[translate] ${locale} Pass 2 — context-aware`);

            // Embed context hints into values
            const stringsWithContext: Record<string, string> = {};
            for (const [key, value] of Object.entries(enStrings)) {
              const hint = contextHints[key];
              stringsWithContext[key] = hint
                ? `[${hint}] ${value}`
                : value;
            }

            const contextResult = await lingo.localizeObject(
              stringsWithContext,
              { sourceLocale: 'en', targetLocale: locale },
              (progress: number) => {
                console.log(`[translate] ${locale} P2 progress: ${progress}%`);
              }
            );

            // Strip context hint prefix that may have leaked into translation
            const cleanResult: Record<string, string> = {};
            for (const [key, value] of Object.entries(contextResult)) {
              cleanResult[key] = typeof value === 'string'
                ? value.replace(/^\[[^\]]*\]\s*/u, '').trim()
                : String(value);
            }

            // Save final context-aware translation
            const localePath = path.join(messagesDir, `${locale}.json`);
            fs.writeFileSync(localePath, JSON.stringify(cleanResult, null, 2));
            console.log(`[translate] ${locale} Pass 2 done — saved to ${locale}.json`);

            emit(controller, { type: 'locale_done', locale });
            translated.push(locale);

          } catch (err: any) {
            console.error(`[translate] ${locale} failed:`, err.message);
            emit(controller, {
              type: 'locale_error',
              locale,
              error: err.message,
            });
            // Continue with next locale — don't abort everything
          }
        }

        emit(controller, {
          type: 'complete',
          locales: translated,
          total: translated.length,
        });

      } catch (err: any) {
        console.error('[translate] Fatal error:', err.message);
        emit(controller, { type: 'error', message: err.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
