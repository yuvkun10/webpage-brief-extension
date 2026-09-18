# Webpage Brief Extension

Webpage Brief is a Manifest V3 browser extension that turns the current tab into a short
extractive summary. It reads visible page text in the browser, scores likely content
blocks, selects high-value sentences, and lets you copy or export the result as plain
text. Everything runs locally; there is no backend. Version 1.0.0.

## Installation

Prerequisites: Node.js 24.x, npm, and a Chromium-based browser that supports Manifest V3
extensions. No environment variables are required.

```bash
npm ci
npm run build
```

## Usage

Load the unpacked extension:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select the generated `dist` folder.
5. Open a webpage, click Webpage Brief, choose a summary length, and click Summarize page.

Daily commands:

```bash
npm run lint       # Run ESLint
npm test           # Run Vitest tests
npm run build      # Type-check and build the extension into dist/
npm run audit      # Fail on moderate-or-higher npm advisories
npm run outdated   # Report stale npm dependencies
```

There is no release or store publishing setup in this repository.

## Project structure

```text
├── public
│   ├── manifest.json
│   └── icons
├── src
│   ├── domain
│   │   ├── briefFormatting.ts
│   │   ├── contentScoring.ts
│   │   └── summarizer.ts
│   └── extension
│       ├── pageExtractor.ts
│       ├── popup.css
│       └── popup.ts
├── tests
├── docs
│   ├── architecture.md
│   └── archive
├── popup.html
├── vite.config.ts
└── package.json
```

How the pieces fit together: [docs/architecture.md](docs/architecture.md).

## Coding style

ESLint runs the recommended JavaScript and typescript-eslint rule sets
(`eslint.config.js`), and TypeScript runs in `strict` mode with `tsc --noEmit` as part of
the build. CI runs both on every push to `main` and every pull request. There is no
formatter or commit convention configured.

```bash
npm run lint
npm run build
```

## Test

```bash
npm test
```

Vitest covers the domain modules: brief formatting, content scoring and the summarizer.
The popup and page extractor have no automated tests.

## Documentation

- [docs/README.md](docs/README.md): index of all docs
- [docs/architecture.md](docs/architecture.md): flow, components, permissions and privacy
- [docs/overview.md](docs/overview.md): audience and use cases
- [docs/operations.md](docs/operations.md): dependency maintenance

## License

MIT. See [LICENSE](LICENSE).
