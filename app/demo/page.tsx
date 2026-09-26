"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categories, samples, type Sample } from "./mock-results";

function CodeView({
  sample,
  annotated = false,
}: {
  sample: Sample;
  annotated?: boolean;
}) {
  const comments = new Map(
    sample.comments.map((comment) => [comment.line, comment.category]),
  );
  return (
    <div
      className="mock-code"
      aria-label={annotated ? "Classified original code" : "Original code"}
    >
      {sample.lines.map((line, index) => {
        const category = comments.get(index);
        const detail = category && categories[category];
        return (
          <div
            className={`mock-code-row ${category ? `comment-row ${annotated ? `category-${category}` : ""}` : ""}`}
            key={index}
          >
            <div className="mock-code-text">
              <span className="mock-line-number">{index + 1}</span>
              <code>{line || " "}</code>
            </div>
            {annotated && detail && (
              <div className="comment-annotation">
                <span className="category-label">{detail.label}</span>
                <span className="category-action">{detail.action}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResultPane({
  model,
  sample,
  status,
}: {
  model: "Jev" | "Codex";
  sample: Sample;
  status: "ready" | "running" | "done";
}) {
  const time = model === "Jev" ? sample.mockTime.jev : sample.mockTime.codex;
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
            : status === "running"
              ? "Running"
              : "Ready"}
        </span>
      </div>
      <div className="mock-pane-body" aria-live="polite">
        {status === "done" ? (
          <CodeView sample={sample} annotated />
        ) : (
          <div className="empty-result">
            <span className="empty-symbol">
              {status === "running" ? "◌" : "{ }"}
            </span>
            <p>
              {status === "running"
                ? "Classifying comments…"
                : "Run the comparison to view classifications"}
            </p>
          </div>
        )}
      </div>
      <div className="mock-pane-footer">
        <span>
          Time taken <small>(mock)</small>
        </span>
        <strong>{status === "done" ? time : "—"}</strong>
      </div>
    </article>
  );
}

export default function Demo() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [status, setStatus] = useState<"ready" | "running" | "done">("ready");
  const [showGuide, setShowGuide] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sample = samples[sampleIndex];
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function reset(index = sampleIndex) {
    if (timer.current) clearTimeout(timer.current);
    setSampleIndex(index);
    setStatus("ready");
  }
  function run() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("running");
    timer.current = setTimeout(() => setStatus("done"), 900);
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
            <i /> Mock results
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
              disabled={status === "running"}
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
              disabled={status === "ready"}
              aria-label="Reset comparison"
            >
              ↺
            </button>
            <button
              className="run-button"
              onClick={run}
              disabled={status === "running"}
            >
              {status === "running"
                ? "Running…"
                : status === "done"
                  ? "Run again"
                  : "Run comparison"}
            </button>
          </div>
        </div>
        {showGuide && (
          <section className="category-guide" aria-label="Comment categories">
            <div className="guide-intro">
              <strong>Comment categories</strong>
              <span>Illustrative classification rules</span>
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
          <ResultPane model="Jev" sample={sample} status={status} />
          <ResultPane model="Codex" sample={sample} status={status} />
        </section>
      </main>
    </div>
  );
}
