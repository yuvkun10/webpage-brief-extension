# Webpage Brief Extension

Webpage Brief is a Manifest V3 browser extension that summarizes the active tab locally. It extracts readable page text in the browser, ranks content blocks, and generates a deterministic extractive summary without sending page content to a remote service.

## Features

- Manifest V3 popup extension using `activeTab` and `scripting` permissions only.
- Local content extraction from the active webpage.
- Deterministic sentence scoring and extractive summaries.
- Copy-to-clipboard and plain-text export.
- TypeScript, linting, tests, and production build output.

## Development

```bash
npm ci
npm run lint
npm test
npm run build
```

To load the extension locally, run `npm run build`, open the browser extensions page, enable developer mode, and load the generated `dist` folder as an unpacked extension.
