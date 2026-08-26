import Link from "next/link";
import type { Metadata } from "next";
import { products } from "@/config/products.config";
import { siteConfig } from "@/config/site.config";

const title = "Product";
const description = "Tools and templates to help you plan your UK FIRE journey — beyond what the free calculators cover.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/store" },
  openGraph: { title: `${title} — ${siteConfig.name}`, description, url: `${siteConfig.url}/store` },
};

export default function StorePage() {
  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
      <div className="mb-8">
        <div className="mb-2 font-data text-xs font-semibold uppercase tracking-wide text-accent-dim">
          Shop
        </div>
        <h1 className="font-heading text-[clamp(28px,5vw,40px)] font-bold leading-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 max-w-[62ch] font-body text-[14.5px] text-text-muted">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/store/${product.slug}`}
            className="block rounded-[var(--radius-token)] border border-line bg-card p-5 shadow-sm transition-colors hover:border-accent-dim"
          >
            <h2 className="font-heading text-[16px] font-semibold text-ink">{product.name}</h2>
            <p className="mt-2 text-[13px] text-text-muted">{product.tagline}</p>
            <p className="mt-3 font-data text-[13px] font-semibold text-accent-dim">{product.price}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
