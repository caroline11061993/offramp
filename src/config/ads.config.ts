/** Directly-sold ad creative registry — static image + link only for v1, no ad-network script. */
export interface AdCreative {
  id: string;
  imageSrc: string; // public/ads/*
  imageAlt: string;
  href: string;
  width: number; // intrinsic dimensions, required for CLS-safe reservation
  height: number;
  sponsorLabel?: string; // e.g. "Sponsored"
}

/** No creative sold yet for any slot — AdSlot renders its reserved-but-empty box for
 *  every entry below until a real placement is signed. */
export const AD_SLOTS: Record<string, AdCreative | null> = {
  "fire-age-results-inline": null,
  "fire-number-results-inline": null,
  "guides-sidebar": null,
};
