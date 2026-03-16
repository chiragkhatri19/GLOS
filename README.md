# glos.io

> Give your i18n pipeline eyes.

AI translation tools translate your strings blind — 
no idea whether "save" is on a checkout page or a 
settings form. glos fixes this by taking screenshots 
of your running app, extracting UI context with a 
vision LLM, and injecting that context into your 
Lingo.dev translation pipeline.

**Same key. Same app. Completely different context.**

## How it works
Your running app
↓
npx @chiragbuilds/glos capture --url http://localhost:3000
↓
Headless browser visits every route → screenshots
↓
Vision LLM reads each screenshot → extracts UI context
↓
lingo.context.json  (maps each string to its visual context)
↓
Lingo.dev BYOLLM pipeline → context-aware translations
↓
"save" on /checkout → "購入を確定する" (confirm purchase) ✓
"save" on /settings → "変更を保存する" (save changes) ✓

## Quick start
```bash
# 1. Install and capture context from your running app
npx @chiragbuilds/glos capture --url http://localhost:3000

# 2. View results in the dashboard
open https://glos-dashboard.vercel.app

# 3. See your translation quality scores
npx @chiragbuilds/glos report
```

## The problem

Without glos, AI translators see:
```json
{ "save": "Save" }
```
And guess. Usually wrong.

With glos, they see:
```json
{
  "save": {
    "value": "Save",
    "page": "/checkout",
    "element_type": "button",
    "context": "Primary CTA to confirm purchase in checkout flow",
    "tone": "urgent"
  }
}
```

## Stack

- **Playwright** — headless browser, captures every route
- **Vision LLM** — reads screenshots, understands UI context
- **Lingo.dev** — BYOLLM translation pipeline
- **Next.js** — dashboard UI
- **TypeScript** — end to end

## Monorepo structure
glos-monorepo/
├── apps/
│   ├── dashboard/     # Next.js dashboard (context viewer + quality scores)
│   └── demo/          # Example app with 16 locales (Acme Corp)
└── packages/
    ├── cli/           # npx @chiragbuilds/glos
    ├── core/          # Playwright capture + vision analysis
    └── types/         # Shared TypeScript types

## Links

- Dashboard: https://glos-dashboard.vercel.app
- Demo app: https://glos-demo.vercel.app  
- npm: https://npmjs.com/package/@chiragbuilds/glos
- GitHub: https://github.com/chiragkhatri19/GLOS

## Built for Lingo.dev Hackathon #3
