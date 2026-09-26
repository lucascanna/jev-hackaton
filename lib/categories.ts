// Shared classification contract from the approved mockup.
export const categories = {
  useful: {
    label: "Useful context",
    action: "Keep",
    example: "The provider may retry this request; keep processing idempotent.",
  },
  directive: {
    label: "Required directive",
    action: "Keep",
    example: "License notice, lint directive, generated-file marker",
  },
  obvious: {
    label: "Obvious narration",
    action: "Delete",
    example: "Increment the counter.",
  },
  history: {
    label: "Editing history",
    action: "Delete or move to commit history",
    example: "We used to call X, but now call Y.",
  },
  excessive: {
    label: "Excessive explanation",
    action: "Shorten",
    example: "A paragraph defending a straightforward choice",
  },
  stale: {
    label: "Stale or inaccurate",
    action: "Flag for verification",
    example: "Returns null when the function now throws.",
  },
  unclear: {
    label: "Unclear intent",
    action: "Investigate and rewrite if the reason can be established",
    example: "Don’t change this; it breaks things.",
  },
} as const;

export type Category = keyof typeof categories;
