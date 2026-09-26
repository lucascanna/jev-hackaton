import { cleanupWithCodex, cleanupWithJev, CleanupError, MAX_BODY_BYTES, parseInput } from "@/lib/cleanup";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      throw new CleanupError("Send a JSON request.", 415);
    }
    // Fetch Metadata survives preview proxies that rewrite the internal URL.
    // Requiring JSON and omitting CORS headers also prevents simple cross-origin POSTs.
    const site = request.headers.get("sec-fetch-site");
    if (site && site !== "same-origin" && site !== "none") {
      throw new CleanupError("Requests must come from this app.", 403);
    }
    const reader = request.body?.getReader();
    if (!reader) throw new CleanupError("Send a code snippet.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
          await reader.cancel();
          throw new CleanupError("The snippet is too large.", 413);
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw new CleanupError("Send valid JSON.", 400); }
    const { code, provider } = parseInput(body);
    const result = await (provider === "jev" ? cleanupWithJev : cleanupWithCodex)(code, request.signal);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof CleanupError ? error.message : "Cleanup failed. Please try again." }, {
      status: error instanceof CleanupError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
