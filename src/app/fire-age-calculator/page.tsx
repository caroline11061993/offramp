import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
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

export default function FireAgeCalculatorPage() {
  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10">
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
    </main>
  );
}
