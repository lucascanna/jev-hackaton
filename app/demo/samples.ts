import type { Category } from "@/lib/categories";

export type Sample = {
  file: string;
  path: string;
  description: string;
  lines: string[];
  comments: { line: number; category: Category }[];
};

export const samples: Sample[] = [
  {
    file: "submit.ts",
    path: "src / billing",
    description: "A sample with each classification represented.",
    lines: [
      "// Copyright 2026 Example Contributors. Licensed under MIT.",
      "export async function submit(orderId: string) {",
      "  // Call the provider.",
      "  // The provider may retry this request; keep processing idempotent.",
      "  const result = await provider.submit(orderId);",
      "  // We used to call the legacy API, but now use the provider.",
      "  // A Map gives us fast access and is a very good choice here.",
      "  const cache = new Map<string, string>();",
      "  // Returns null when the provider fails.",
      "  if (!result.ok) throw new Error('Provider failed');",
      "  // Don't change this; it breaks things.",
      "  cache.set(orderId, result.id);",
      "  return cache;",
      "}",
    ],
    comments: [
      { line: 0, category: "directive" },
      { line: 2, category: "obvious" },
      { line: 3, category: "useful" },
      { line: 5, category: "history" },
      { line: 6, category: "excessive" },
      { line: 8, category: "stale" },
      { line: 10, category: "unclear" },
    ],
  },
  {
    file: "retry.ts",
    path: "src / utils",
    description: "Retry logic with useful context and obvious narration.",
    lines: [
      "// Retry a failed request.",
      "export async function retry<T>(fn: () => Promise<T>) {",
      "  // Loop through the attempts.",
      "  for (let i = 0; i < 3; i++) {",
      "    try {",
      "      return await fn();",
      "    } catch (error) {",
      "      if (i === 2) throw error;",
      "      // Jitter prevents synchronized retries across workers.",
      "      const delay = 100 * 2 ** i + Math.random() * 100;",
      "      await new Promise(r => setTimeout(r, delay));",
      "    }",
      "  }",
      "}",
    ],
    comments: [
      { line: 0, category: "obvious" },
      { line: 2, category: "obvious" },
      { line: 8, category: "useful" },
    ],
  },
  {
    file: "cache.ts",
    path: "src / utils",
    description: "Cache normalization with an upstream API constraint.",
    lines: [
      "const cache = new Map<string, string>();",
      "// Get a value from the cache.",
      "export function readCache(key: string) {",
      "  // Normalize the key.",
      "  const normalized = key.toLowerCase();",
      "  // The upstream API treats keys as case-insensitive.",
      "  return cache.get(normalized);",
      "}",
    ],
    comments: [
      { line: 1, category: "obvious" },
      { line: 3, category: "obvious" },
      { line: 5, category: "useful" },
    ],
  },
];
