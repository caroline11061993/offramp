export interface Product {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  payhipLink: string;
  description: string;
  included: string[];
  faqs: { q: string; a: string }[];
}

export const products: Product[] = [
  {
    slug: "budget-planner",
    name: "UK Savings Rate & FIRE Budget Planner",
    tagline:
      "See exactly how much sooner you could reach financial independence — just by adjusting your spending.",
    price: "£10",
    payhipLink: "https://payhip.com/b/mvh3f",
    description:
      "Most budget planners stop at tracking where your money goes. This one goes a step further: every category is linked to a live projection, so you can see in real time how a £50 cut to one line item moves your actual FIRE date — not just your monthly total. It's paired with a UK tax year tracker so you're not leaving ISA, LISA or pension allowance unused before the 5 April deadline.",
    included: [
      "Editable spreadsheet — works in Excel or Google Sheets",
      "Savings rate dashboard with your projected FIRE age",
      '"What if" tool: see how cutting any spending category changes your FIRE date',
      "UK tax year allowance tracker for ISA, LISA and pension contributions",
      "One-off purchase, yours to keep and reuse every year",
    ],
    faqs: [
      {
        q: "Do I need Excel to use this?",
        a: "No — it works in both Excel and Google Sheets. Just download the file and open it, or upload it to Google Drive and it converts automatically.",
      },
      {
        q: "Is this the same as the free calculator on the site?",
        a: "No. The free calculator gives you a single FIRE number estimate. This is an editable spreadsheet you keep, with a full monthly budget, an interactive savings-rate dashboard, and a UK tax year allowance tracker — tools you use on an ongoing basis, not a one-off number.",
      },
      {
        q: "Will this work for my income?",
        a: "Yes — every figure is fully editable, so it adapts to your own income, spending, and savings, whatever they are.",
      },
    ],
  },
  // Add future products here (e.g. the tax-optimized FIRE toolkit) —
  // the store page, product pages, and CTAs all update automatically.
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
