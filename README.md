# Jev comment review demo

The landing page links to the full-screen `/demo` application. Both Jev and Codex classify the same source comments using the categories from the approved mockup:

| Category | Recommended action |
| --- | --- |
| Useful context | Keep |
| Required directive | Keep |
| Obvious narration | Delete |
| Editing history | Delete or move to commit history |
| Excessive explanation | Shorten |
| Stale or inaccurate | Flag for verification |
| Unclear intent | Investigate and rewrite if the reason can be established |

Results show original code with highlighted comments, category labels, actions, and elapsed request time below each model. The app does not change or execute source code. Actions are recommendations. Sample inputs are examples; classifications and timings come from API calls.

## Run

Requires Node 24+ and npm.

```sh
npm ci
cp .env.example .env.local
# Fill in OPENAI_API_KEY and JEV_API_KEY on the server.
npm run dev
```

Open http://localhost:3000 and select **Try it now**. Keep keys in the gitignored `.env.local`, never in `NEXT_PUBLIC_` variables. Restart after changing keys.

Jev uses `POST https://api.typesafe.ai/v1/systemone` with one seven-option Choice per parsed comment and the full source as state. Codex uses OpenAI's Responses API with the same comment IDs and seven-category schema. Results must classify every comment exactly once; incomplete/invalid responses fail visibly. One provider can succeed when the other fails. Reset cancels requests and discards stale results.

Defaults: `JEV_MODEL=jev-latest`, `OPENAI_MODEL=gpt-5.3-codex`. Optional `JEV_BASE_URL` and `OPENAI_BASE_URL` override API roots. Do not send real keys to test endpoints. JavaScript/TypeScript without JSX, 20,000 characters and 40 comments per request; provider timeout is 90 seconds. Timing includes server preparation, network and response processing, not just model inference. No speed or accuracy benchmark is claimed.

Source is sent to both providers; OpenAI uses `store: false`. No application database or source logging. Keep the demo private: there is no user authentication or per-user quota enforcement.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

Tests use synthetic responses, not live credentials. References: [Jev API](https://docs.typesafe.ai/api), [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
