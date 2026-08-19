import type { Metadata } from "next";
import { getRecommendationsByCategory } from "@/config/recommendations.config";
import { siteConfig } from "@/config/site.config";

const title = "Resources";
const description =
  "A curated directory of tools and services that can help close a FIRE gap — side income, decumulation planning, diversification, and platform comparisons.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resources" },
  openGraph: { title: `${title} — ${siteConfig.name}`, description, url: `${siteConfig.url}/resources` },
};

const CATEGORY_LABELS: Record<string, string> = {
  "side-gig": "Side income",
  decumulation: "Decumulation & drawdown",
  diversification: "Diversification",
  "platform-comparison": "Platform comparisons",
};

export default function ResourcesPage() {
  const byCategory = getRecommendationsByCategory();

  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
      <div className="mb-8">
        <div className="mb-2 font-data text-xs font-semibold uppercase tracking-wide text-accent-dim">
          Directory
        </div>
        <h1 className="font-heading text-[clamp(28px,5vw,40px)] font-bold leading-tight text-ink">Resources</h1>
        <p className="mt-3 max-w-[62ch] font-body text-[14.5px] text-text-muted">{description}</p>
        <p className="mt-2 max-w-[62ch] text-[12px] text-text-faint">
          Some links on this page are affiliate links, and some placements are directly sold — each is
          labelled. We don&apos;t own or operate any of these products.
        </p>
      </div>

      {Object.entries(byCategory).map(([category, items]) =>
        items.length > 0 ? (
          <section key={category} className="mb-8">
            <h2 className="mb-3 font-heading text-[15px] font-semibold text-ink">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-token)] border border-line bg-card p-4 shadow-sm">
                  <div className="font-heading text-[13.5px] font-medium text-ink">{item.title}</div>
                  <p className="mt-1 text-[12.5px] text-text-muted">{item.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <a href={item.href} className="font-heading text-[12.5px] font-semibold text-accent-dim hover:text-accent">
                      {item.ctaLabel} →
                    </a>
                    <span className="font-data text-[10px] uppercase tracking-wide text-text-faint">
                      {item.disclosure ?? "Affiliate link"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </main>
  );
}
