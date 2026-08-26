/**
 * Affiliate/partner recommendation rules + content. Rules decide WHICH category applies
 * to a given calculator result; items are the swappable content for each category — no
 * partners are signed yet, so every item below is a structural placeholder.
 */

export type RecommendationCategory =
  | "side-gig"
  | "decumulation"
  | "diversification"
  | "platform-comparison";

export interface RecommendationItem {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  href: string; // affiliate/direct link — swap without touching component code
  ctaLabel: string;
  disclosure?: string; // e.g. "Affiliate link" — shown inline near the CTA
  /** No partner signed yet — excluded from every lookup below until this is removed. */
  placeholder?: boolean;
}

/**
 * The generalized signal both calculators reduce their result down to, so
 * RecommendationModule never needs to know about FireAgeInputs/FireNumberResult
 * internals directly.
 */
export interface RecommendationSignal {
  /** Years between now and the calculator's headline retirement outcome. */
  gapYearsToRetirement?: number;
  /** How close the user is to their target retirement age. */
  yearsToTargetRetirement?: number;
  /** Held equity as a fraction of liquid assets at the tested retirement age. */
  equityConcentrationPct?: number;
  /** True when the plan doesn't survive to life expectancy on current inputs. */
  planShort?: boolean;
}

export interface RecommendationRule {
  id: string;
  category: RecommendationCategory;
  matches: (signal: RecommendationSignal) => boolean;
  priority: number; // lower = shown first when multiple rules match
}

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: "large-gap-side-gig",
    category: "side-gig",
    priority: 1,
    matches: (s) => (s.gapYearsToRetirement ?? 0) > 10 || s.planShort === true,
  },
  {
    id: "near-retirement-decumulation",
    category: "decumulation",
    priority: 1,
    matches: (s) => (s.yearsToTargetRetirement ?? Infinity) <= 5,
  },
  {
    id: "high-equity-concentration",
    category: "diversification",
    priority: 1,
    // Mirrors the source calculator's own 30% concentration warning threshold.
    matches: (s) => (s.equityConcentrationPct ?? 0) > 0.3,
  },
];

export const RECOMMENDATION_ITEMS: RecommendationItem[] = [
  {
    id: "placeholder-side-gig-1",
    category: "side-gig",
    title: "TBD — side income platform",
    description: "Placeholder: a partner that helps close a large gap-to-retirement with extra income.",
    href: "#",
    ctaLabel: "Learn more",
    placeholder: true,
  },
  {
    id: "placeholder-decumulation-1",
    category: "decumulation",
    title: "TBD — drawdown / retirement income advice",
    description: "Placeholder: a partner for people within a few years of their target retirement age.",
    href: "#",
    ctaLabel: "Learn more",
    placeholder: true,
  },
  {
    id: "placeholder-diversification-1",
    category: "diversification",
    title: "TBD — diversification / equity sale planning",
    description: "Placeholder: a partner for users with concentrated single-stock equity positions.",
    href: "#",
    ctaLabel: "Learn more",
    placeholder: true,
  },
  {
    id: "placeholder-platform-1",
    category: "platform-comparison",
    title: "TBD — ISA/SIPP platform comparison",
    description: "Placeholder: a platform-comparison partner for general ISA/SIPP guide traffic.",
    href: "#",
    ctaLabel: "Compare platforms",
    placeholder: true,
  },
];

function matchingCategories(signal: RecommendationSignal): RecommendationCategory[] {
  return [...RECOMMENDATION_RULES]
    .filter((rule) => rule.matches(signal))
    .sort((a, b) => a.priority - b.priority)
    .map((rule) => rule.category);
}

export function getRecommendationsFor(
  signal: RecommendationSignal,
  maxItems = 3,
): RecommendationItem[] {
  const categories = matchingCategories(signal);
  const seen = new Set<string>();
  const items: RecommendationItem[] = [];

  for (const category of categories) {
    for (const item of RECOMMENDATION_ITEMS) {
      if (item.category !== category || item.placeholder || seen.has(item.id)) continue;
      items.push(item);
      seen.add(item.id);
      if (items.length >= maxItems) return items;
    }
  }
  return items;
}

/** Direct category lookup for pages that already know their topic (e.g. a guide page)
 *  rather than deriving it from a calculator result signal. */
export function getRecommendationsForCategory(
  category: RecommendationCategory,
  maxItems = 2,
): RecommendationItem[] {
  return RECOMMENDATION_ITEMS.filter((item) => item.category === category && !item.placeholder).slice(
    0,
    maxItems,
  );
}

export function getRecommendationsByCategory(): Record<RecommendationCategory, RecommendationItem[]> {
  const categories: RecommendationCategory[] = [
    "side-gig",
    "decumulation",
    "diversification",
    "platform-comparison",
  ];
  return Object.fromEntries(
    categories.map((category) => [
      category,
      RECOMMENDATION_ITEMS.filter((item) => item.category === category && !item.placeholder),
    ]),
  ) as Record<RecommendationCategory, RecommendationItem[]>;
}
