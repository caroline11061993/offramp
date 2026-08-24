import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleFrontmatter } from "@/lib/mdx/content";

const CALCULATOR_LABELS: Record<ArticleFrontmatter["relatedCalculator"], string> = {
  "fire-age-calculator": "FIRE Age Calculator",
  "fire-number-calculator": "FIRE Number Calculator",
};

export function ArticleLayout({
  frontmatter,
  eyebrow = "Guide",
  nextArticle,
  children,
}: {
  frontmatter: ArticleFrontmatter;
  eyebrow?: string;
  nextArticle?: { href: string; title: string } | null;
  children: ReactNode;
}) {
  const calculatorHref = `/${frontmatter.relatedCalculator}`;
  const calculatorLabel = CALCULATOR_LABELS[frontmatter.relatedCalculator];

  return (
    <article className="mx-auto max-w-[720px] px-5 pb-20 pt-10">
      <div className="mb-2 font-data text-xs font-semibold uppercase tracking-wide text-accent-dim">
        {eyebrow}
      </div>
      <h1 className="font-heading text-[clamp(28px,5vw,38px)] font-bold leading-tight text-ink">
        {frontmatter.title}
      </h1>
      <div className="mt-4 rounded-[var(--radius-token)] border border-line bg-card-2 p-4 text-[14px] leading-relaxed text-ink">
        {frontmatter.dek ?? frontmatter.description}
      </div>

      <div className="prose-guide mt-8">{children}</div>

      <div className="mt-10 rounded-[var(--radius-token)] border border-accent-dim bg-accent-soft p-4">
        <div className="font-heading text-[13px] font-semibold text-ink">Ready to run your own numbers?</div>
        <Link
          href={calculatorHref}
          className="mt-1.5 inline-block font-heading text-[13px] font-semibold text-accent-dim hover:text-accent"
        >
          Try the {calculatorLabel} →
        </Link>
      </div>

      {nextArticle ? (
        <Link
          href={nextArticle.href}
          className="mt-4 block rounded-[var(--radius-token)] border border-line bg-card p-4 shadow-sm transition-colors hover:border-accent-dim"
        >
          <div className="font-data text-[10px] uppercase tracking-wide text-text-faint">Next article</div>
          <div className="mt-1 font-heading text-[14px] font-semibold text-ink">{nextArticle.title} →</div>
        </Link>
      ) : null}
    </article>
  );
}
