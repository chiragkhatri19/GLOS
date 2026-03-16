# @chiragbuilds/glos-core

Core engine for glos.io - Give your i18n pipeline eyes.

## Overview

This package provides the core functionality for capturing UI screenshots and extracting context using Vision LLMs. It includes:

- **Playwright-based screenshot capture** - Headless browser automation for capturing all routes
- **Gemini Vision integration** - AI-powered UI element extraction from screenshots  
- **Context file generation** - Maps translation keys to their visual context
- **Quality scoring** - Analyzes translation quality based on UI context

## Installation

```bash
npm install @chiragbuilds/glos-core
```

## Usage

### Capture Screenshots

```typescript
import { captureApp } from '@chiragbuilds/glos-core';

const result = await captureApp({
  url: 'http://localhost:3000',
  outputDir: '.glos/screenshots',
  onProgress: (event) => {
    console.log('Progress:', event);
  }
});
```

### Build Context File

```typescript
import { buildContextFile } from '@chiragbuilds/glos-core';

const context = await buildContextFile(
  allElements,
  appUrl,
  localeMessages
);
```

## Environment Variables

- `GEMINI_API_KEY` - Required: Gemini API key from Google AI Studio
- `GEMINI_API_KEY_2` through `GEMINI_API_KEY_5` - Optional fallback keys for rate limiting

## Files Structure

```
dist/
├── capture.js      # Screenshot capture logic
├── vision.js       # Vision LLM analysis
├── context.js      # Context file builder
├── quality.js      # Quality scoring
├── translate.js    # Translation pipeline
├── types.js        # TypeScript type definitions
└── index.js        # Main entry point
```

## License

MIT

## Links

- npm: https://npmjs.com/package/@chiragbuilds/glos-core
- GitHub: https://github.com/chiragkhatri19/GLOS
- Dashboard: https://glos-dashboard.vercel.app
