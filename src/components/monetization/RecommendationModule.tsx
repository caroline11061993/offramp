import {
  getRecommendationsFor,
  type RecommendationItem,
  type RecommendationSignal,
} from "@/config/recommendations.config";

export interface RecommendationModuleProps {
  /** Derive recommendations from a calculator result signal (used on calculator pages). */
  signal?: RecommendationSignal;
  /** Or pass an explicit item list directly (used on guide pages, which already know their topic). */
  items?: RecommendationItem[];
  maxItems?: number;
  heading?: string;
}

export function RecommendationModule({
  signal,
  items: explicitItems,
  maxItems = 3,
  heading = "You might also find useful",
}: RecommendationModuleProps) {
  const items = explicitItems ?? getRecommendationsFor(signal ?? {}, maxItems);
  if (items.length === 0) return null;

  return (
    <section className="mt-6 rounded-[var(--radius-token)] border border-line bg-card p-5 shadow-sm" aria-label={heading}>
      <h3 className="font-heading text-[14.5px] font-semibold text-ink">{heading}</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-1 rounded-lg border border-line bg-bg p-3.5"
          >
            <div className="font-heading text-[13px] font-medium text-ink">{item.title}</div>
            <p className="text-[12.5px] text-text-muted">{item.description}</p>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={item.href}
                className="font-heading text-[12.5px] font-semibold text-accent-dim hover:text-accent"
              >
                {item.ctaLabel} →
              </a>
              {item.disclosure ? (
                <span className="font-data text-[10px] uppercase tracking-wide text-text-faint">
                  {item.disclosure}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
