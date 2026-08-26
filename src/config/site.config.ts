export const siteConfig = {
  name: "Our Offramp",
  tagline: "Find our offramp.",
  description:
    "Free UK FIRE calculators. Find the age financial independence becomes possible, or the number you need to get there — full year-by-year simulation with real UK tax bands built in.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  locale: "en-GB",
  nav: [
    { label: "FIRE Age Calculator", href: "/fire-age-calculator" },
    { label: "FIRE Number Calculator", href: "/fire-number-calculator" },
    { label: "Guides", href: "/guides" },
    { label: "Must Read", href: "/resources" },
    { label: "Product", href: "/store" },
    { label: "About", href: "/about" },
  ],
} as const;
