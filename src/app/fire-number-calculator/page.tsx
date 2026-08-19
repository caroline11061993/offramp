import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
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

export default function FireNumberCalculatorPage() {
  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
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
    </main>
  );
}
