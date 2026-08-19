import Image from "next/image";
import { AD_SLOTS } from "@/config/ads.config";

export interface AdSlotProps {
  slotId: keyof typeof AD_SLOTS;
  width: number;
  height: number;
}

/**
 * Always renders a fixed-size box, whether or not a creative is configured — a slot
 * that loads late and shifts the page is a measurable SEO penalty (CLS), so the space
 * is reserved even when empty.
 */
export function AdSlot({ slotId, width, height }: AdSlotProps) {
  const creative = AD_SLOTS[slotId];

  if (!creative) {
    return (
      <div
        style={{ width, height }}
        className="mx-auto flex items-center justify-center rounded-[var(--radius-token)] border border-dashed border-line-strong bg-card-2"
        aria-hidden="true"
      />
    );
  }

  return (
    <div style={{ width, height }} className="mx-auto flex flex-col items-center gap-1">
      {creative.sponsorLabel ? (
        <span className="font-data text-[10px] uppercase tracking-wide text-text-faint">
          {creative.sponsorLabel}
        </span>
      ) : null}
      <a href={creative.href} className="block overflow-hidden rounded-[var(--radius-token)]">
        <Image
          src={creative.imageSrc}
          alt={creative.imageAlt}
          width={creative.width}
          height={creative.height}
        />
      </a>
    </div>
  );
}
