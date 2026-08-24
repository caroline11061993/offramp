import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleFrontmatter } from "@/lib/mdx/content";
import { RecommendationModule } from "@/components/monetization/RecommendationModule";
import { getRecommendationsForCategory, type RecommendationCategory } from "@/config/recommendations.config";

const CALCULATOR_LABELS: Record<ArticleFrontmatter["relatedCalculator"], string> = {
  "fire-age-calculator": "FIRE Age Calculator",
  "fire-number-calculator": "FIRE Number Calculator",
};

const CALCULATOR_RECOMMENDATION_SIGNAL: Record<
  ArticleFrontmatter["relatedCalculator"],
  { forCategory: RecommendationCategory }
> = {
  "fire-age-calculator": { forCategory: "diversification" },
  "fire-number-calculator": { forCategory: "platform-comparison" },
};

export function ArticleLayout({
  frontmatter,
  eyebrow = "Guide",
  children,
}: {
  frontmatter: ArticleFrontmatter;
  eyebrow?: string;
  children: ReactNode;
}) {
  const calculatorHref = `/${frontmatter.relatedCalculator}`;
  const calculatorLabel = CALCULATOR_LABELS[frontmatter.relatedCalculator];
  const recCategory = CALCULATOR_RECOMMENDATION_SIGNAL[frontmatter.relatedCalculator].forCategory;

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

      <RecommendationModule
        items={getRecommendationsForCategory(recCategory, 2)}
        heading="You might also find useful"
      />
    </article>
  );
}
