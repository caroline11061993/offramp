import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, getProduct } from "@/config/products.config";
import { siteConfig } from "@/config/site.config";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: `/store/${slug}` },
    openGraph: {
      title: product.name,
      description: product.tagline,
      url: `${siteConfig.url}/store/${slug}`,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      {/* Payhip's own script — required for the .payhip-buy-button links below to open their checkout. */}
      <Script src="https://payhip.com/payhip.js" strategy="afterInteractive" />

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-10">
        <Link href="/store" className="font-heading text-[12.5px] font-semibold text-text-muted hover:text-ink">
          ← Back to product
        </Link>

        <section className="mt-6 text-center">
          <h1 className="font-heading text-[clamp(28px,5vw,38px)] font-bold leading-tight text-ink">
            {product.name}
          </h1>
          <p className="mt-4 font-body text-[16px] text-text-muted">{product.tagline}</p>

          <div className="mt-6">
            <a
              href={product.payhipLink}
              className="payhip-buy-button inline-block rounded-lg bg-accent px-7 py-3 font-heading text-[14px] font-semibold text-white shadow hover:bg-accent-dim"
              data-theme="none"
            >
              Get it — {product.price}
            </a>
            <p className="mt-2 text-[12px] text-text-faint">
              Instant download. Works in Excel and Google Sheets.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-[16px] font-semibold text-ink">What&apos;s inside</h2>
          <ul className="mt-3 space-y-2.5">
            {product.included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-text-muted">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-[16px] font-semibold text-ink">
            Why this isn&apos;t just another budget template
          </h2>
          <p className="prose-guide mt-3">{product.description}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-[16px] font-semibold text-ink">FAQ</h2>
          <div className="mt-3 divide-y divide-line">
            {product.faqs.map((f) => (
              <details key={f.q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-[13.5px] font-medium text-ink">
                  {f.q}
                  <span className="ml-4 text-text-faint transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[13.5px] text-text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 text-center">
          <a
            href={product.payhipLink}
            className="payhip-buy-button inline-block rounded-lg bg-accent px-7 py-3 font-heading text-[14px] font-semibold text-white shadow hover:bg-accent-dim"
            data-theme="none"
          >
            Get it — {product.price}
          </a>
        </section>
      </main>
    </>
  );
}
