# Jev comment review demo

The landing page at `/` links to the full-screen application at `/demo` through “Try it now”. The application shows an original TypeScript sample beside mocked Jev and Codex results. Each result repeats the original code with comment blocks highlighted by category and action, with a mocked model time below it. Open **Categories** for the classification key.

Results and times are deterministic fixtures, not live Jev or Codex integrations or performance measurements. No provider credentials are needed. Edit `app/demo/mock-results.ts` to iterate on the categories, samples, and mock timings before connecting the agents.

## Development

Requires Node.js 20.9+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The landing page lives in `app/page.tsx`, the application in `app/demo/page.tsx`, and shared styles in `app/globals.css`.

## Checks and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```
