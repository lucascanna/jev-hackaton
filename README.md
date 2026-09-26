# Jev comment cleanup demo

A minimal Next.js App Router application for comparing comment cleanup with Jev and a direct LLM agent. The homepage is a static scaffold; agent integrations and comparison results are not implemented yet.

## Development

Requires Node.js 20.9+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Edit `app/page.tsx` to update the homepage and `app/globals.css` to change its styles.

## Checks and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```
