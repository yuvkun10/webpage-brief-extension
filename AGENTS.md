# AGENTS.md

Webpage Brief is a Manifest V3 browser extension that summarizes the current tab locally. There is no backend.

## Setup

Node.js 24.x and npm. No environment variables are required.

```bash
npm ci
npm run build   # writes the unpacked extension to dist/
```

Load `dist` through `chrome://extensions` with Developer mode on.

## Commands

```bash
npm run lint      # eslint .
npm test          # vitest run
npm run build     # tsc --noEmit && vite build
npm run audit     # npm audit --audit-level=moderate
npm run outdated  # npm outdated
```

## Project structure

- `src/domain/`: brief formatting, content scoring, summarizer (tested).
- `src/extension/`: popup UI and page extractor (no automated tests).
- `popup.html`, `vite.config.ts`: extension build entry.
- `tests/`: Vitest suites.

Details are in [docs/architecture.md](docs/architecture.md).

## Conventions

- TypeScript `strict`. ESLint recommended JavaScript and `typescript-eslint` rules.
- No formatter or commit convention is enforced. Do not add attribution trailers.

## Testing

Before a PR run lint, test, build, audit and outdated. CI runs the same.

## Safety

- Page text stays in the browser. Do not add network calls, telemetry or new extension permissions without an explicit request.
- There is no store publishing setup. Do not add one unasked.

## More

- [docs/README.md](docs/README.md): docs index
- [docs/architecture.md](docs/architecture.md): permissions and privacy
- [docs/operations.md](docs/operations.md): dependency maintenance
