import Link from "next/link";
import type { Metadata } from "next";
import { getAllResourceArticles } from "@/lib/mdx/resources";
import { siteConfig } from "@/config/site.config";

const title = "Must Read";
const description =
  "Plain-English guides on UK tax wrappers, pension mechanics, and investment platforms — the general financial-literacy pieces worth reading alongside the calculators.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resources" },
  openGraph: { title: `${title} — ${siteConfig.name}`, description, url: `${siteConfig.url}/resources` },
};

export default function ResourcesIndexPage() {
  const articles = getAllResourceArticles();

  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
      <div className="mb-8">
        <div className="mb-2 font-data text-xs font-semibold uppercase tracking-wide text-accent-dim">
          Learn
        </div>
        <h1 className="font-heading text-[clamp(28px,5vw,40px)] font-bold leading-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 max-w-[62ch] font-body text-[14.5px] text-text-muted">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/resources/${article.slug}`}
            className="block rounded-[var(--radius-token)] border border-line bg-card p-5 shadow-sm transition-colors hover:border-accent-dim"
          >
            <h2 className="font-heading text-[16px] font-semibold text-ink">{article.frontmatter.title}</h2>
            <p className="mt-2 text-[13px] text-text-muted">{article.frontmatter.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
