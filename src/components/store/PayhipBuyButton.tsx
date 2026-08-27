"use client";

export function PayhipBuyButton({
  href,
  price,
  product,
}: {
  href: string;
  price: string;
  product: string;
}) {
  return (
    <a
      href={href}
      className="payhip-buy-button inline-block rounded-lg bg-accent px-7 py-3 font-heading text-[14px] font-semibold text-white shadow hover:bg-accent-dim"
      data-theme="none"
      onClick={() => window.gtag?.("event", "payhip_click", { product })}
    >
      Get it — {price}
    </a>
  );
}
