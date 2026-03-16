# glos.io

> Your i18n pipeline is context-blind. glos fixes that.

glos crawls your live app, extracts every UI string with its DOM context,
and makes your translations understand the difference between "Save" on 
a form and "Save" in a danger zone.

## Usage
```bash
# Scan your running app
npx @chiragbuilds/glos capture --url http://localhost:3000

# View last scan report  
npx @chiragbuilds/glos report

# Output as JSON
npx @chiragbuilds/glos report --json
```

## How it works

1. **CRAWL** — Playwright discovers every route automatically
2. **EXTRACT** — Screenshots sent to Gemini vision for UI text extraction
3. **ENRICH** — Each string gets classified with tone + ambiguity score
4. **TRANSLATE** — Context-aware strings go to your translation pipeline

## Dashboard

After scanning, open your glos dashboard at http://localhost:3002 to:
- View the context map for every string
- See translation quality across 10 locales  
- Run Fix All to translate with context

## Environment
```bash
GEMINI_API_KEY=your_key_here
LINGODOTDEV_API_KEY=your_key_here
```

## Stack

Built with Playwright, Gemini Vision, Lingo.dev SDK, Next.js 15.
