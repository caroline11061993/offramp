import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

const title = "About";
const description =
  "Why I built Our Offramp — a personal note on FIRE, career ladders, and wanting real numbers instead of generic calculators.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: `${title} — ${siteConfig.name}`, description, url: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[720px] px-5 pb-20 pt-10">
      <div className="mb-2 font-data text-xs font-semibold uppercase tracking-wide text-accent-dim">
        About
      </div>
      <h1 className="font-heading text-[clamp(28px,5vw,38px)] font-bold leading-tight text-ink">
        Why I built Our Offramp
      </h1>

      <div className="prose-guide mt-8">
        <p>
          Our Offramp started with me sitting at the dinner table after work, messing around with
          Claude Code.
        </p>
        <p>
          I&apos;m 30+, and I&apos;ve spent years climbing the career ladder in tech. But what I
          really want is simple: to do creative work, help people, and cook good food.
        </p>
        <p>
          The problem? Wanting a different life and being able to afford it are two very different
          things. For a long time, I let money quietly make that decision for me.
        </p>
        <p>
          FIRE — Financial Independence, Retire Early — became the bridge. Not retirement in the
          traditional sense, but enough financial runway that work stops deciding what I&apos;m
          allowed to do with my life.
        </p>
        <p>
          I built FIRE Age and FIRE Number because I wanted real numbers to answer a simple
          question: how far away am I from having that choice? Not vague inspiration or assumptions
          baked into generic calculators.
        </p>
        <p>
          If you&apos;ve climbed further than you expected to and are wondering whether
          there&apos;s another version of your life available to you, Our Offramp is for you — with
          the calculators, tools, and resources I wish I&apos;d had sooner.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/fire-age-calculator"
          className="rounded-lg bg-accent px-4.5 py-2.5 font-heading text-[12.5px] font-semibold text-white shadow hover:bg-accent-dim"
        >
          Try the FIRE Age Calculator →
        </Link>
        <Link
          href="/fire-number-calculator"
          className="rounded-lg border border-line-strong bg-card px-4.5 py-2.5 font-heading text-[12.5px] font-semibold text-ink hover:border-accent-dim"
        >
          Try the FIRE Number Calculator →
        </Link>
      </div>
    </main>
  );
}
