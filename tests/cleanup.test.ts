import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanupWithCodex, cleanupWithJev, sourceComments, parseInput } from "../lib/cleanup.ts";
import { categories, type Category } from "../lib/categories.ts";
const originalFetch = globalThis.fetch;
const keys = { OPENAI_API_KEY: process.env.OPENAI_API_KEY, JEV_API_KEY: process.env.JEV_API_KEY };
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(keys)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
});
const code = '// Copyright Example\n// Increment counter\nlet n = 1;';
const answer = (category: Category) => ({ type: "choice", choice: category, confidence: .9, probabilities: Object.fromEntries(Object.keys(categories).map(key => [key, key === category ? 1 : 0])) });
const codexBody = (comments: unknown) => ({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ comments }) }] }] });

test("uses exactly the seven approved mockup categories and actions", () => {
  assert.deepEqual(Object.values(categories).map(c => [c.label, c.action]), [
    ["Useful context", "Keep"], ["Required directive", "Keep"], ["Obvious narration", "Delete"],
    ["Editing history", "Delete or move to commit history"], ["Excessive explanation", "Shorten"],
    ["Stale or inaccurate", "Flag for verification"], ["Unclear intent", "Investigate and rewrite if the reason can be established"],
  ]);
});

test("extracts real comments including directives, not strings or template text", () => {
  const source = '// first\nconst url = "https://example.com/*data*/";\nconst re = /[/*]/;\nconst tpl = `// text ${1 /* inside */ + 2} /* text */`; // last';
  assert.deepEqual(sourceComments(source).map(c => c.text), ["// first", "/* inside */", "// last"]);
  assert.equal(sourceComments('/** docs */\n// @ts-ignore\nconst x=1;').length, 2);
  assert.throws(() => sourceComments('function broken('), /complete/);
});

test("validates provider and source boundaries", () => {
  for (const value of [null, {}, { code: " " }, { code: 12 }, { code: "x".repeat(20001) }, { code: "x", provider: "invalid" }]) assert.throws(() => parseInput(value));
  assert.deepEqual(parseInput({ code, provider: "jev" }), { code, provider: "jev" });
});

test("Jev gets all seven criteria for every comment, including licenses", async () => {
  process.env.JEV_API_KEY = "synthetic";
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /\/systemone$/);
    const body = JSON.parse(String(init?.body));
    assert.equal(body.state.source, code);
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer synthetic");
    assert.equal(Object.keys(body.questions).length, 2);
    for (const question of Object.values(body.questions) as {criteria: object}[]) assert.deepEqual(Object.keys(question.criteria), Object.keys(categories));
    return Response.json({ model: "jev-test", answers: { comment_0: answer("directive"), comment_1: answer("obvious") } });
  };
  const result = await cleanupWithJev(code);
  assert.deepEqual(result.comments.map(c => c.category), ["directive", "obvious"]);
  for (const comment of result.comments) assert.equal(code.slice(comment.start, comment.end), comment.text);
  assert.equal("code" in result, false);
});

test("Codex receives the same category schema and maps IDs regardless of output order", async () => {
  process.env.OPENAI_API_KEY = "synthetic";
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /\/responses$/);
    const body = JSON.parse(String(init?.body));
    assert.equal(body.store, false);
    assert.deepEqual(body.text.format.schema.properties.comments.items.properties.category.enum, Object.keys(categories));
    assert.equal(JSON.parse(body.input).source, code);
    return Response.json(codexBody([{ id: "comment_1", category: "obvious" }, { id: "comment_0", category: "directive" }]));
  };
  const result = await cleanupWithCodex(code);
  assert.deepEqual(result.comments.map(c => c.category), ["directive", "obvious"]);
  assert.equal("code" in result, false);
});

test("Jev rejects absent, unknown or malformed categories and distributions", async () => {
  process.env.JEV_API_KEY = "synthetic";
  for (const invalid of [undefined, {}, { ...answer("stale"), choice: "remove" }, { ...answer("stale"), confidence: 2 }, { ...answer("stale"), probabilities: { stale: 1 } }]) {
    globalThis.fetch = async () => Response.json({ model: "jev-test", answers: { comment_0: invalid, comment_1: answer("useful") } });
    await assert.rejects(cleanupWithJev(code), /invalid classifications/);
  }
});

test("Codex rejects missing, duplicate, unknown IDs and old keep/remove labels", async () => {
  process.env.OPENAI_API_KEY = "synthetic";
  for (const comments of [[], [{id:"comment_0",category:"useful"},{id:"comment_0",category:"stale"}], [{id:"unknown",category:"useful"},{id:"comment_1",category:"stale"}], [{id:"comment_0",category:"keep"},{id:"comment_1",category:"obvious"}]]) {
    globalThis.fetch = async () => Response.json(codexBody(comments));
    await assert.rejects(cleanupWithCodex(code), /invalid classifications/);
  }
});

test("both providers skip comment-free code and enforce comment bounds", async () => {
  globalThis.fetch = async () => { throw new Error("must not call"); };
  for (const run of [cleanupWithCodex, cleanupWithJev]) {
    assert.deepEqual((await run('const x=1;')).comments, []);
    await assert.rejects(run('// note\n'.repeat(41)), /40 comments/);
  }
});

test("missing credentials and provider errors remain independent and sanitized", async () => {
  delete process.env.JEV_API_KEY;
  await assert.rejects(cleanupWithJev(code), /JEV_API_KEY/);
  for (const run of [cleanupWithCodex, cleanupWithJev]) {
    process.env.OPENAI_API_KEY = process.env.JEV_API_KEY = "synthetic";
    for (const status of [401, 429, 500]) {
      globalThis.fetch = async () => new Response("private upstream details", { status });
      await assert.rejects(run(code), (error: Error) => { assert.doesNotMatch(error.message, /private|synthetic/); return true; });
    }
  }
});
