export const siteConfig = {
  name: "Offramp",
  tagline: "Find your offramp.",
  description:
    "Free UK FIRE calculators. Find the age financial independence becomes possible, or the number you need to get there — full year-by-year simulation with real UK tax bands built in.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  locale: "en-GB",
  nav: [
    { label: "FIRE Age Calculator", href: "/fire-age-calculator" },
    { label: "FIRE Number Calculator", href: "/fire-number-calculator" },
    { label: "Guides", href: "/guides" },
    { label: "Resources", href: "/resources" },
    { label: "About", href: "/about" },
  ],
} as const;
