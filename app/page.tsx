import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header>
        <Link className="brand" href="/" aria-label="Jev demo home">jev<span> / demo</span></Link>
        <span className="badge">Comment cleanup</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Less noise. More context.</p>
        <h1 id="page-title">Keep the knowledge.<br />Remove the narration.</h1>
        <p className="description">
          A small experiment in better code comments. Compare how Jev and an LLM
          spot outdated explanations, trim the obvious, and preserve what matters.
        </p>
      </section>

      <section className="comparison" aria-label="Comparison approaches">
        <article>
          <span className="number">01</span>
          <h2>With Jev</h2>
          <p>Explore comment cleanup with a Jev-backed agent.</p>
        </article>
        <article>
          <span className="number">02</span>
          <h2>With an LLM</h2>
          <p>Run the same cleanup task with a direct LLM agent.</p>
        </article>
      </section>

      <footer>
        <span>One repository. Two approaches.</span>
        <span>Comparison coming soon</span>
      </footer>
    </main>
  );
}
