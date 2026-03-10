# @chiragbuilds/glos

> Give your AI translator eyes.

Lingo.dev has been translating your app blind. glos gives it eyes.

The word "save" appears 6 times in your app. On a settings form, a checkout page,
a file manager. Lingo.dev translates all 6 the same way. In Japanese, that's wrong
for at least 4 of them.

glos screenshots your running app, reads every text element in its visual context
using Gemini Vision, and feeds that context into Lingo.dev's translation engine.

Same app. Same API key. Dramatically better translations.

## Quick start

```bash
npx @chiragbuilds/glos capture --url http://localhost:3000
npx @chiragbuilds/glos translate --locales ja,de,ar
npx @chiragbuilds/glos report
```

## Requirements

- `GEMINI_API_KEY` — free at [aistudio.google.com](https://aistudio.google.com)
- `LINGODOTDEV_API_KEY` — from [lingo.dev](https://lingo.dev)
- Node.js 20+
- Your app running (localhost or any URL)

## Results

| Key | Route | Before | After |
|-----|-------|--------|-------|
| `save` | `/settings` | 保存 | 変更を保存 |
| `save` | `/checkout` | 保存 | 購入を確定する |
| `delete` | `/account` | 削除 | アカウントを完全に削除する |
| `confirm` | `/checkout` | 確認 | 購入を完了する |

## Commands

```bash
glos capture --url <url>           # Screenshot app, extract context
glos translate --locales ja,de,ar  # Translate with context
glos report                        # Show before/after quality
glos report --json                 # Machine-readable output (for CI)
```

## GitHub Action

```yaml
- uses: actions/checkout@v4

- name: Run glos
  run: |
    npx @chiragbuilds/glos capture --url ${{ vars.DEMO_APP_URL }}
    npx @chiragbuilds/glos translate --locales ja,de,ar
    npx @chiragbuilds/glos report --json
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    LINGODOTDEV_API_KEY: ${{ secrets.LINGODOTDEV_API_KEY }}
```

## How it works

1. **Playwright** screenshots every route of your app
2. **Gemini Vision** reads each screenshot — extracts every UI text element with its context
3. **glos** builds `glos.context.json` — maps every translation key to where it appears
4. **Lingo.dev SDK** translates with context hints injected per key

Built for the Lingo.dev Hackathon #3.
