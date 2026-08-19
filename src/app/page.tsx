import Link from "next/link";
import { getAllGuides } from "@/lib/mdx/guides";

export default function Home() {
  const guides = getAllGuides().slice(0, 3);

  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-14">
      <header className="mb-12 max-w-[62ch]">
        <h1 className="font-heading text-[clamp(34px,6vw,52px)] font-bold leading-[1.08] text-ink">
          Find your <em className="not-italic text-accent">offramp</em>.
        </h1>
        <p className="mt-4 font-body text-[17px] italic text-accent-dim">
          When does work become optional? How big does the number actually need to be?
        </p>
        <p className="mt-3 font-body text-[14.5px] text-text-muted">
          Use the FIRE Age Calculator to find out when work becomes optional — a full year-by-year
          simulation showing when you can stop working for money once you reach financial
          independence. Use the FIRE Number Calculator to find out how big that number needs to be.
        </p>
      </header>

      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/fire-age-calculator"
          className="block rounded-[var(--radius-token)] border border-line-strong bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-dim hover:shadow-md"
        >
          <div className="font-data text-[10px] uppercase tracking-wide text-text-faint">Calculator 01</div>
          <h2 className="mt-1 font-heading text-[19px] font-semibold text-ink">FIRE Age Calculator</h2>
          <p className="mt-2 text-[13.5px] text-text-muted">
            A full year-by-year simulation showing exactly when work could become optional.
          </p>
          <div className="mt-3 font-heading text-[12.5px] font-semibold text-accent-dim">Start →</div>
        </Link>
        <Link
          href="/fire-number-calculator"
          className="block rounded-[var(--radius-token)] border border-line-strong bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-dim hover:shadow-md"
        >
          <div className="font-data text-[10px] uppercase tracking-wide text-text-faint">Calculator 02</div>
          <h2 className="mt-1 font-heading text-[19px] font-semibold text-ink">FIRE Number Calculator</h2>
          <p className="mt-2 text-[13.5px] text-text-muted">
            A quicker rule-of-thumb target, plus a real, life-expectancy-aware verdict.
          </p>
          <div className="mt-3 font-heading text-[12.5px] font-semibold text-accent-dim">Start →</div>
        </Link>
      </div>

      {guides.length > 0 ? (
        <div className="mb-14">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-heading text-[18px] font-semibold text-ink">From the guides</h2>
            <Link href="/guides" className="font-heading text-[12.5px] font-semibold text-accent-dim">
              All guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block rounded-[var(--radius-token)] border border-line bg-card p-4 shadow-sm hover:border-accent-dim"
              >
                <h3 className="font-heading text-[14px] font-semibold text-ink">{guide.frontmatter.title}</h3>
                <p className="mt-1.5 text-[12.5px] text-text-muted">{guide.frontmatter.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[var(--radius-token)] border border-line bg-card-2 p-5 text-[13px] text-text-muted">
        Calculations run entirely in your browser — nothing you enter is saved or sent anywhere. Your
        scenario is encoded into the page URL, so you can bookmark or share it if you want to.
      </div>
    </main>
  );
}
