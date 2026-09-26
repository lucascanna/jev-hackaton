"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categories } from "@/lib/categories";
import { samples, type Sample } from "./samples";
import type { Classification, CleanupResult } from "@/lib/cleanup";

function CodeView({
  sample,
  annotations,
}: {
  sample: Sample;
  annotations?: Classification[];
}) {
  return (
    <div
      className="mock-code"
      aria-label={annotations ? "Classified original code" : "Original code"}
    >
      {sample.lines.map((line, index) => {
        const matches = annotations?.filter(comment => index >= comment.line - 1 && index < comment.line + comment.text.split(/\r\n|[\n\r\u2028\u2029]/).length - 1) || [];
        const category = matches[0]?.category;
        return (
          <div
            className={`mock-code-row ${category ? `comment-row ${`category-${category}`}` : ""}`}
            key={index}
          >
            <div className="mock-code-text">
              <span className="mock-line-number">{index + 1}</span>
              <code>{line || " "}</code>
            </div>
            {matches.filter(comment => comment.line - 1 === index).map(comment => (
              <div className="comment-annotation" key={comment.start}>
                <span className="category-label">{categories[comment.category].label}</span>
                <span className="category-action">{categories[comment.category].action}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ResultPane({
  model,
  sample,
  state,
}: {
  model: "Jev" | "Codex";
  sample: Sample;
  state: RunState;
}) {
  const { status, result, error } = state;
  return (
    <article className="mock-pane result-pane" aria-label={`${model} result`}>
      <div className="mock-pane-header">
        <div className="model-name">
          <span className={`model-mark ${model.toLowerCase()}`}>
            {model === "Jev" ? "✳" : "◇"}
          </span>
          <h2>{model}</h2>
        </div>
        <span className="pane-status">
          {status === "done"
            ? "Result"
            : status === "error" ? "Error" : status === "running"
              ? "Running"
              : "Ready"}
        </span>
      </div>
      <div className="mock-pane-body" aria-live="polite">
        {status === "done" ? (
          <CodeView sample={sample} annotations={result?.comments} />
        ) : (
          <div className="empty-result">
            <span className="empty-symbol">
              {status === "running" ? "◌" : "{ }"}
            </span>
            <p>
              {status === "running"
                ? "Classifying comments…"
                : error || "Run the comparison to view classifications"}
            </p>
          </div>
        )}
      </div>
      <div className="mock-pane-footer">
        <span>
          Time taken <small>(request)</small>
        </span>
        <strong>{result ? `${(result.elapsedMs / 1000).toFixed(2)} s` : "—"}</strong>
      </div>
    </article>
  );
}

type RunState = { status: "ready" | "running" | "done" | "error"; result?: CleanupResult; error?: string };
const ready: RunState = { status: "ready" };

export default function Demo() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [runs, setRuns] = useState({ jev: ready, codex: ready });
  const [showGuide, setShowGuide] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const sample = samples[sampleIndex];
  const running = runs.jev.status === "running" || runs.codex.status === "running";
  useEffect(() => () => controller.current?.abort(), []);
  function reset(index = sampleIndex) {
    controller.current?.abort();
    controller.current = null;
    setSampleIndex(index);
    setRuns({ jev: ready, codex: ready });
  }
  async function run() {
    if (running) return;
    const current = new AbortController();
    controller.current = current;
    setRuns({ jev: { status: "running" }, codex: { status: "running" } });
    await Promise.all((["jev", "codex"] as const).map(async provider => {
      try {
        const response = await fetch("/api/cleanup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, code: sample.lines.join("\n") }),
          signal: AbortSignal.any([current.signal, AbortSignal.timeout(100_000)]),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Classification failed. Try again.");
        if (controller.current === current) setRuns(previous => ({ ...previous, [provider]: { status: "done", result: body } }));
      } catch (error) {
        if (controller.current === current) setRuns(previous => ({ ...previous, [provider]: {
          status: "error", error: error instanceof Error && error.name === "TimeoutError" ? "Request timed out. Try again." : error instanceof Error ? error.message : "Could not connect. Try again.",
        } }));
      }
    }));
  }

  return (
    <div className="shell app-shell demo-app">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Jev home">
          jev<span className="brand-dot">✳</span>
        </Link>
        <span className="header-divider" />
        <h1 className="app-title">Comment review</h1>
        <div className="header-right">
          <span className="demo-badge">
            <i /> API comparison
          </span>
          <button
            className="text-button"
            onClick={() => setShowGuide(!showGuide)}
            aria-expanded={showGuide}
          >
            Categories <span aria-hidden="true">{showGuide ? "▴" : "▾"}</span>
          </button>
        </div>
      </header>
      <main>
        <div className="mock-toolbar">
          <div className="sample-picker">
            <label htmlFor="sample">Sample file</label>
            <select
              id="sample"
              value={sampleIndex}
              onChange={(event) => reset(Number(event.target.value))}
              disabled={running}
            >
              {samples.map((item, index) => (
                <option value={index} key={item.file}>
                  {item.file}
                </option>
              ))}
            </select>
            <span className="sample-description">{sample.description}</span>
          </div>
          <div className="run-actions">
            <button
              className="reset"
              onClick={() => reset()}
              disabled={runs.jev.status === "ready" && runs.codex.status === "ready"}
              aria-label="Reset comparison"
            >
              ↺
            </button>
            <button
              className="run-button"
              onClick={run}
              disabled={running}
            >
              {running ? "Running…" : "Run comparison"}
            </button>
          </div>
        </div>
        {showGuide && (
          <section className="category-guide" aria-label="Comment categories">
            <div className="guide-intro">
              <strong>Comment categories</strong>
              <span>Same categories for both models</span>
            </div>
            <div className="guide-grid">
              {Object.entries(categories).map(([key, detail]) => (
                <div key={key} className={`guide-item category-${key}`}>
                  <strong>{detail.label}</strong>
                  <span className="guide-example">{detail.example}</span>
                  <span>{detail.action}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="mock-comparison" aria-label="Code comparison">
          <article className="mock-pane original-pane">
            <div className="mock-pane-header">
              <h2>Original code</h2>
              <span className="pane-status">Input</span>
            </div>
            <div className="mock-file-bar">
              {sample.path} / <strong>{sample.file}</strong>
              <span>{sample.comments.length} comments</span>
            </div>
            <div className="mock-pane-body">
              <CodeView sample={sample} />
            </div>
            <div className="mock-pane-footer">
              <span>Source file</span>
              <strong>{sample.file}</strong>
            </div>
          </article>
          <ResultPane model="Jev" sample={sample} state={runs.jev} />
          <ResultPane model="Codex" sample={sample} state={runs.codex} />
        </section>
      </main>
    </div>
  );
}
