import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq, type FaqItem } from "@/components/seo/Faq";
import { softwareApplicationJsonLd, faqPageJsonLd } from "@/lib/seo/schema";
import { FireNumberCalculatorClient } from "./FireNumberCalculatorClient";

const title = "FIRE Number Calculator — How Big Does It Need to Be?";
const description =
  "A quick UK FIRE number calculator: rule-of-thumb target plus a real, life-expectancy-aware verdict — including mortgage payoff timing and an optional property-sale comparison.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fire-number-calculator" },
  openGraph: { title, description, url: `${siteConfig.url}/fire-number-calculator` },
};

const faqs: FaqItem[] = [
  {
    question: "What withdrawal rate should I use?",
    answer:
      "The default is 3.5%, deliberately more conservative than the commonly-cited 4% rule — a FIRE retirement usually needs to last well longer than the roughly 30 years the original 4% research assumed. The hint under the withdrawal-rate field adjusts based on how your actual horizon (life expectancy minus retirement age) compares to that 30-year assumption.",
  },
  {
    question: "Why does the calculator show two different numbers?",
    answer:
      "The quick target is a rule-of-thumb figure — annual spending divided by your withdrawal rate, plus projected debt at retirement — useful for a gut check. The verdict underneath it is a real year-by-year projection that walks your savings forward, applies UK pension-access-age locking, and checks whether the money actually lasts to your life expectancy. The two can disagree: the most common case is a healthy net worth that still comes back 'short' because too much of it sits in a pension you can't touch until 57, and your target retirement age is younger than that.",
  },
  {
    question: "Does this calculator account for inflation?",
    answer:
      "No — everything you enter and everything you see is already in today's pounds, and growth rates are entered as real (above-inflation) rates. That trade-off is what makes it fast, compared to the full year-by-year FIRE Age Calculator, which does model inflation and UK fiscal drag explicitly.",
  },
  {
    question: "How is my mortgage handled?",
    answer:
      "You enter today's balance and the calculator projects it forward itself, using the same monthly amortization math as the FIRE Age Calculator. The projected balance at retirement feeds directly into the quick target formula, and is cleared from the verdict's projection either as a lump sum or spread out as an ongoing repayment through retirement, depending on which mode you choose.",
  },
  {
    question: "Is my property included automatically?",
    answer:
      "No — property is kept deliberately separate from your target and debt. Switching it on shows what your plan looks like if you sold at retirement, shown alongside the without-property numbers, so you can see exactly how much the house is doing for your plan without committing to selling it.",
  },
];

export default function FireNumberCalculatorPage() {
  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
      <JsonLd
        data={softwareApplicationJsonLd({ name: "FIRE Number Calculator", description, path: "/fire-number-calculator" })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      <div className="mb-6">
        <h1 className="font-heading text-[clamp(28px,5vw,40px)] font-bold leading-tight text-ink">
          FIRE Number Calculator
        </h1>
        <p className="mt-3 max-w-[62ch] font-body text-[14.5px] text-text-muted">
          Find out how big your pot needs to be — a rule-of-thumb target plus a real,
          life-expectancy-aware verdict that accounts for mortgage payoff timing and pension access age.
        </p>
      </div>
      <Suspense>
        <FireNumberCalculatorClient />
      </Suspense>

      <div className="prose-guide mt-14 max-w-[680px] border-t border-line pt-10">
        <h2>How this calculator works</h2>
        <p>
          The quick target is one formula: annual spending divided by your withdrawal rate, plus your
          debt projected forward to retirement. The verdict underneath it is a real simulation — it
          grows your liquid assets and pension separately from today, clears your mortgage at
          retirement, and checks whether the money survives all the way to your life expectancy,
          respecting the rule that pension money can&apos;t be touched before age 57.
        </p>
        <p>
          For the full breakdown of every step, see{" "}
          <Link href="/guides/how-the-fire-number-calculator-works">
            How the FIRE Number Calculator works
          </Link>
          .
        </p>

        <h2>Worked example</h2>
        <p>
          Take someone aged 35 who wants to retire at 55, spends £25,000 a year in retirement, and has
          £150,000 left on a mortgage (4%, 25-year term). They hold £15,000 in cash, £60,000 in an ISA,
          and £80,000 in a pension — £155,000 in total — growing at 5% a year, with a 3.5% withdrawal
          rate.
        </p>
        <ul>
          <li>
            <strong>Quick target:</strong> £25,000 ÷ 3.5%, plus a projected mortgage balance of about
            £42,992 at age 55, comes to roughly <strong>£757,000</strong>.
          </li>
          <li>
            <strong>Real verdict:</strong> at the current savings rate, the projection runs dry before
            life expectancy — a &quot;save to fix&quot; verdict, recommending about{" "}
            <strong>£853 a month</strong> in additional saving to close the gap.
          </li>
        </ul>
      </div>

      <Faq items={faqs} />
    </main>
  );
}
