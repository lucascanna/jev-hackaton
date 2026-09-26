import Link from "next/link";

export default function Home() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Jev home">
          jev<span className="brand-dot">✳</span>
        </Link>
        <span className="header-divider" />
        <span className="lab-name">A little context goes a long way.</span>
      </header>
      <main className="landing">
        <section className="intro landing-intro">
          <div>
            <p className="eyebrow">
              <span /> SMALLER COMMENTS. BIGGER CLARITY.
            </p>
            <h1>
              Less noise.
              <br />
              <span>More context.</span>
            </h1>
            <p className="description">
              Jev helps coding agents understand the why behind your code.
              <br className="desktop-break" /> Keep the knowledge that matters.
              Clear away the clutter.
            </p>
            <Link className="try-button" href="/demo">
              Try it now <span aria-hidden="true">↗</span>
            </Link>
            <p className="landing-caption">
              An interactive demo. No setup needed.
            </p>
          </div>
          <aside
            className="landing-example"
            aria-label="An example of useful context"
          >
            <div className="example-label">THE DIFFERENCE IS IN THE WHY</div>
            <p className="example-removed">
              <span aria-hidden="true">−</span> <s>{"// Wait before retrying"}</s>
            </p>
            <p className="example-kept">
              <span aria-hidden="true">✓</span>{" // Jitter prevents synchronized retries."}
            </p>
            <div className="example-explanation">
              Remove the narration.
              <br />
              <strong>Preserve the reason.</strong>
            </div>
          </aside>
        </section>
        <section className="landing-summary" aria-labelledby="experiment-title">
          <p className="eyebrow">ONE TASK. TWO APPROACHES.</p>
          <h2 id="experiment-title">Start with better code comments.</h2>
          <p>
            Explore a comment-cleanup task with Jev and Codex side by side. See
            what each removes, what it keeps, and why that context matters.
          </p>
          <span className="demo-badge">
            Sample results today. Live agents to follow.
          </span>
        </section>
        <footer className="page-footer">
          <span className="footer-brand">
            jev<span>✳</span>
            <small>Built for the details that matter.</small>
          </span>
          <a
            href="https://github.com/lucascanna/jev-hackaton"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub ↗
          </a>
        </footer>
      </main>
    </div>
  );
}
