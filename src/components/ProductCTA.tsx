import Link from "next/link";
import { getProduct } from "@/config/products.config";

export interface ProductCTAProps {
  slug: string;
  variant?: "default" | "compact";
}

export function ProductCTA({ slug, variant = "default" }: ProductCTAProps) {
  const product = getProduct(slug);
  if (!product) return null;

  if (variant === "compact") {
    return (
      <Link
        href={`/store/${product.slug}`}
        className="mt-8 block rounded-[var(--radius-token)] border border-line bg-card-2 px-4 py-3 text-[13px] text-text-muted transition-colors hover:border-accent-dim"
      >
        <span className="font-heading font-medium text-ink">{product.tagline}</span> See the{" "}
        {product.name} →
      </Link>
    );
  }

  return (
    <div className="rounded-[var(--radius-token)] border border-accent-dim bg-accent-soft p-5">
      <h3 className="font-heading text-[14px] font-semibold text-ink">Want to actually hit this date?</h3>
      <p className="mt-1.5 text-[13px] text-text-muted">{product.tagline}</p>
      <Link
        href={`/store/${product.slug}`}
        className="mt-3 inline-block rounded-lg bg-accent px-4.5 py-2 font-heading text-[12.5px] font-semibold text-white shadow hover:bg-accent-dim"
      >
        See the {product.name} — {product.price}
      </Link>
    </div>
  );
}
