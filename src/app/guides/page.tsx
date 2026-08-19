import Link from "next/link";
import type { Metadata } from "next";
import { getAllGuides } from "@/lib/mdx/guides";
import { siteConfig } from "@/config/site.config";

const title = "Guides";
const description =
  "Plain-English walkthroughs of exactly how the FIRE Age and FIRE Number calculators work — the formulas, the ordering rules, and the logic behind every number.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/guides" },
  openGraph: { title: `${title} — ${siteConfig.name}`, description, url: `${siteConfig.url}/guides` },
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
      <div className="mb-8">
        <div className="mb-2 font-data text-xs font-semibold uppercase tracking-wide text-accent-dim">
          Learn
        </div>
        <h1 className="font-heading text-[clamp(28px,5vw,40px)] font-bold leading-tight text-ink">Guides</h1>
        <p className="mt-3 max-w-[62ch] font-body text-[14.5px] text-text-muted">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block rounded-[var(--radius-token)] border border-line bg-card p-5 shadow-sm transition-colors hover:border-accent-dim"
          >
            <h2 className="font-heading text-[16px] font-semibold text-ink">{guide.frontmatter.title}</h2>
            <p className="mt-2 text-[13px] text-text-muted">{guide.frontmatter.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
