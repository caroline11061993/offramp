import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq, type FaqItem } from "@/components/seo/Faq";
import { softwareApplicationJsonLd, faqPageJsonLd } from "@/lib/seo/schema";
import { FireAgeCalculatorClient } from "./FireAgeCalculatorClient";

const title = "FIRE Age Calculator — When Can You Retire?";
const description =
  "Find the age financial independence becomes possible with a full year-by-year UK simulation: real income tax and NI bands, pension access-age locking, and monthly mortgage amortization.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fire-age-calculator" },
  openGraph: { title, description, url: `${siteConfig.url}/fire-age-calculator` },
};

const faqs: FaqItem[] = [
  {
    question: "Why does it run a simulation instead of using a formula?",
    answer:
      "Because the things that decide your real retirement age change year to year — UK tax bands, a mortgage that eventually gets paid off, care costs that kick in later, a State Pension that starts at a fixed age. The calculator runs a full year-by-year simulation from your current age to your life expectancy, then repeats it for every possible retirement age from next year onward, and reports the earliest one where the simulation makes it all the way to your life expectancy without running out of money.",
  },
  {
    question: "How does pension access-age locking work?",
    answer:
      "Your pension balance counts toward your net worth from day one, but the simulation will not draw a single pound from it before your chosen access age (57 by default — the UK's earliest normal private-pension access age from 2028). If your other accounts run dry before then, the plan is marked as not surviving, even if the pension itself is large.",
  },
  {
    question: "Does it account for real UK income tax and National Insurance?",
    answer:
      "Yes. Take-home pay each working year is computed from your gross salary using real UK income tax and National Insurance bands, including the personal allowance taper above £100,000 — not a flat estimate.",
  },
  {
    question: "What order does it draw money down from in retirement?",
    answer:
      "Cheapest tax consequence first: cash, then your GIA, then your ISA, then your pension once you've reached your access age, and finally property — only if you've opted to include it as a last-resort backstop, and only once everything else is exhausted.",
  },
  {
    question: "Does inflation affect the numbers I see?",
    answer:
      "Every figure you type in is in today's money, but the simulation itself runs in nominal, inflated pounds internally — because UK tax bands are frozen in nominal terms and a mortgage payment is a fixed nominal amount. The result is converted back to today's money before it's shown to you, so you never see a nominal number, but the maths underneath needed them to correctly capture fiscal drag.",
  },
];

export default function FireAgeCalculatorPage() {
  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
      <JsonLd
        data={softwareApplicationJsonLd({ name: "FIRE Age Calculator", description, path: "/fire-age-calculator" })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      <div className="mb-6">
        <h1 className="font-heading text-[clamp(28px,5vw,40px)] font-bold leading-tight text-ink">
          FIRE Age Calculator
        </h1>
        <p className="mt-3 max-w-[62ch] font-body text-[14.5px] text-text-muted">
          A full year-by-year simulation showing when work could become optional — real UK tax bands,
          pension access-age locking, and monthly mortgage amortization.
        </p>
      </div>
      <Suspense>
        <FireAgeCalculatorClient />
      </Suspense>

      <div className="prose-guide mt-14 max-w-[680px] border-t border-line pt-10">
        <h2>How this calculator works</h2>
        <p>
          Rather than solving a formula, the calculator tests every possible retirement age one at a
          time — running a full year-by-year simulation of your salary, spending, tax, mortgage, and
          account balances for each one — and returns the earliest age where the simulation survives
          all the way to your life expectancy without running out of money.
        </p>
        <p>
          For the full breakdown of every rule — nominal-vs-real handling, the decumulation order, and
          how pension locking works — see{" "}
          <Link href="/guides/how-the-fire-age-calculator-works">How the FIRE Age Calculator works</Link>.
        </p>

        <h2>Worked example</h2>
        <p>
          Take someone aged 35 earning £60,000 a year, planning to spend £28,000 a year in retirement.
          They hold £10,000 in cash, £30,000 in an ISA, and £50,000 in a pension (contributing £500 a
          month), own a £300,000 property with £180,000 left on a 4% mortgage over 20 years, growth
          assumed at 6%, and a full State Pension from age 67.
        </p>
        <p>
          Running the simulation for every retirement age from 36 onward, the earliest one that
          survives all the way to life expectancy is <strong>age 57</strong> — the point where pension
          access, the State Pension, and the shrinking mortgage all line up with what their liquid
          savings can carry on their own in the years before.
        </p>
      </div>

      <Faq items={faqs} />
    </main>
  );
}
