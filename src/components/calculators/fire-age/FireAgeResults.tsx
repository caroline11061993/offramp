"use client";

import { useMemo, useState } from "react";
import { findFireAge, simulate } from "@/lib/fire-engine/fire-age";
import { toFireAgeInputs, type FireAgeFormState } from "@/lib/url-state/fire-age-codec";
import { fmtGBP, fmtPct } from "@/lib/format";
import { ResultHero } from "@/components/calculators/shared/ResultHero";
import { FireAgeExplorerChart } from "./FireAgeExplorerChart";
import { FireAgeYearTable } from "./FireAgeYearTable";
import { RecommendationModule } from "@/components/monetization/RecommendationModule";
import { AdSlot } from "@/components/monetization/AdSlot";
import { ProductCTA } from "@/components/ProductCTA";

export function FireAgeResults({ state }: { state: FireAgeFormState }) {
  const inputs = useMemo(() => toFireAgeInputs(state), [state]);

  const liquidSearch = useMemo(() => findFireAge(inputs, false), [inputs]);
  const recommendedAge = liquidSearch.age ?? Math.min(inputs.currentAge + 55, inputs.lifeExpectancy - 1);

  const [testAge, setTestAge] = useState(recommendedAge);
  const clampedTestAge = Math.min(
    Math.max(testAge, inputs.currentAge + 1),
    Math.min(inputs.currentAge + 55, inputs.lifeExpectancy - 1),
  );

  const hasRealProperty = inputs.hasProperty && inputs.propValue0 > 0;
  const liquidResult = useMemo(() => simulate(inputs, clampedTestAge, false), [inputs, clampedTestAge]);
  const illiquidResult = useMemo(
    () => (hasRealProperty ? simulate(inputs, clampedTestAge, true) : null),
    [inputs, clampedTestAge, hasRealProperty],
  );
  const finalLiquid = liquidResult.rows[liquidResult.rows.length - 1];

  return (
    <div>
      {!liquidSearch.age ? (
        <div className="mb-4 rounded-[var(--radius-token)] border border-line bg-card p-4 text-[13.5px] text-text-muted">
          On today&apos;s numbers, your plan doesn&apos;t clear your spending target within the next 55
          years. Try the slider below to see what changes would help — or revisit contributions and
          spending above.
        </div>
      ) : (
        <>
          <ResultHero
            label="Based on everything you've entered, you can likely retire at"
            value={`Age ${recommendedAge}`}
            sub={`That's ${recommendedAge - inputs.currentAge} year${recommendedAge - inputs.currentAge === 1 ? "" : "s"} from now. Drag the slider below to see what happens at any other age.`}
          />
          <div className="mb-4">
            <ProductCTA slug="budget-planner" />
          </div>
        </>
      )}

      <div className="mb-4 rounded-[var(--radius-token)] border border-line bg-card p-5 shadow-sm">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="font-heading text-[14.5px] font-semibold text-ink">Try a different retirement age</h3>
          <div className="font-heading text-2xl font-semibold text-accent-dim">{clampedTestAge}</div>
        </div>
        <div className="mb-3 text-xs text-text-muted">
          Drag to see exactly what happens if you retire earlier or later than the recommended age.
        </div>
        <input
          type="range"
          min={inputs.currentAge + 1}
          max={Math.min(inputs.currentAge + 55, inputs.lifeExpectancy - 1)}
          value={clampedTestAge}
          onChange={(e) => setTestAge(Number(e.target.value))}
          className="w-full accent-accent"
        />

        <Narrative
          survived={liquidResult.survived}
          lifeExpectancy={inputs.lifeExpectancy}
          finalLiquidTotal={finalLiquid.liquidTotal}
          hasRealProperty={hasRealProperty}
          finalPropertyEquity={finalLiquid.propertyEquity}
          impliedSWR={liquidResult.impliedSWR}
          depletionAge={liquidResult.depletionAge}
          depletionRowPropertyEquity={
            liquidResult.depletionAge
              ? liquidResult.rows.find((r) => r.age === liquidResult.depletionAge)?.propertyEquity
              : undefined
          }
          illiquidSurvived={illiquidResult?.survived}
          illiquidFinalTotal={
            illiquidResult?.survived ? illiquidResult.rows[illiquidResult.rows.length - 1].total : undefined
          }
          illiquidDepletionAge={illiquidResult?.depletionAge ?? undefined}
        />

        <div className="my-3.5 rounded-[var(--radius-token)] border border-line bg-card p-3.5">
          <div className="mb-2 font-data text-[11px] uppercase tracking-wide text-text-muted">
            Net worth over time — age (→) vs. money in today&apos;s pounds (↑)
          </div>
          <FireAgeExplorerChart
            liquidRows={liquidResult.rows}
            illiquidRows={illiquidResult?.rows ?? null}
            testAge={clampedTestAge}
            depletionAge={liquidResult.depletionAge}
          />
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-0.5 w-3.5 bg-accent" /> Liquid assets (cash, ISA, GIA, pension)
            </span>
            {hasRealProperty ? (
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-0.5 w-3.5 bg-blue" /> Including property, sold as needed
              </span>
            ) : null}
          </div>
        </div>

        {clampedTestAge < inputs.pensionAccess ? (
          <Warning>
            This retirement age ({clampedTestAge}) is before your pension access age ({inputs.pensionAccess}) —
            the simulation already respects that gate, but it&apos;s worth checking the chart to see how thin
            the bridge gets before then.
          </Warning>
        ) : null}

        <MethodologyDisclosure />

        <div className="mt-5 font-data text-[11px] uppercase tracking-wide text-accent-dim">Year-by-year view</div>
        <div className="mt-2.5">
          <FireAgeYearTable rows={liquidResult.rows} />
        </div>
      </div>

      <RecommendationModule
        signal={{
          gapYearsToRetirement: recommendedAge - inputs.currentAge,
          yearsToTargetRetirement: clampedTestAge - inputs.currentAge,
          planShort: !liquidResult.survived,
        }}
      />

      <div className="mt-5 flex justify-center">
        <AdSlot slotId="fire-age-results-inline" width={336} height={120} />
      </div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-[10px] border border-warn bg-warn-soft p-3 text-[12.5px] text-[#8a3d32]">
      {children}
    </div>
  );
}

const METHODOLOGY_STEPS = [
  {
    title: "Take-home pay.",
    body: "Your salary runs through actual UK income tax and National Insurance bands to find what's really left to save each year.",
  },
  {
    title: "Cash buffer, then surplus.",
    body: "Whatever's left over each year first tops up a cash safety net, then flows into your ISA (up to the annual allowance), then your GIA — in that order, because ISA growth is never taxed. This happens every year, working or retired.",
  },
  {
    title: "Contributions.",
    body: "Any monthly amount you've entered for pension is added on top of this, before growth is applied.",
  },
  {
    title: "Growth.",
    body: "Each account compounds at the rate you set — one rate for ISA/GIA/pension throughout, working and retired, and separate fixed rates for cash and property.",
  },
  {
    title: "Property & mortgage.",
    body: "Tracked entirely separately — appreciating in the background, with the mortgage amortizing month by month. Neither touches your other investments, and property is never sold automatically.",
  },
  {
    title: "Retirement spending.",
    body: "Once you retire, each year's spending is drawn in order: cash first, then GIA, then ISA, then your pension — but only once you reach your access age.",
  },
  {
    title: "Your FIRE age.",
    body: "The simulation tests every possible retirement age from now onward and reports the earliest one where this whole process runs all the way to your life expectancy without running out.",
  },
];

function MethodologyDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-4 text-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-line-strong bg-card-2 px-4 py-2.5 font-heading text-[12.5px] font-semibold text-ink hover:border-accent-dim"
      >
        {open ? "Hide" : "Learn how this is calculated"}
      </button>
      {open ? (
        <div className="mt-2.5 rounded-[var(--radius-token)] border border-line bg-card p-[18px] text-left text-[13px] leading-relaxed text-text-muted">
          <ol className="list-decimal space-y-2.5 pl-5">
            {METHODOLOGY_STEPS.map((step) => (
              <li key={step.title}>
                <span className="font-heading font-semibold text-ink">{step.title}</span> {step.body}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function Narrative({
  survived,
  lifeExpectancy,
  finalLiquidTotal,
  hasRealProperty,
  finalPropertyEquity,
  impliedSWR,
  depletionAge,
  depletionRowPropertyEquity,
  illiquidSurvived,
  illiquidFinalTotal,
  illiquidDepletionAge,
}: {
  survived: boolean;
  lifeExpectancy: number;
  finalLiquidTotal: number;
  hasRealProperty: boolean;
  finalPropertyEquity: number;
  impliedSWR: number | null;
  depletionAge: number | null;
  depletionRowPropertyEquity?: number;
  illiquidSurvived?: boolean;
  illiquidFinalTotal?: number;
  illiquidDepletionAge?: number;
}) {
  if (survived) {
    return (
      <p className="my-3.5 rounded-[10px] border-l-[3px] border-accent-dim bg-card-2 px-3.5 py-3 text-[14px] leading-relaxed text-ink">
        Spending is fully covered by liquid assets alone — cash, ISA, GIA, pension — projected to reach
        about <b className="text-accent-dim">{fmtGBP(finalLiquidTotal)}</b> by age {lifeExpectancy}.
        {hasRealProperty ? (
          <>
            {" "}
            Your property, untouched throughout, would separately be worth roughly{" "}
            <b className="text-accent-dim">{fmtGBP(finalPropertyEquity)}</b>.
          </>
        ) : null}
        {impliedSWR ? (
          <>
            {" "}
            Year-one withdrawal rate: roughly{" "}
            <b className="text-accent-dim">{fmtPct(impliedSWR)}</b> — within the range most planners
            consider sustainable.
          </>
        ) : null}
      </p>
    );
  }

  return (
    <p className="my-3.5 rounded-[10px] border-l-[3px] border-accent-dim bg-card-2 px-3.5 py-3 text-[14px] leading-relaxed text-ink">
      Liquid assets run out around <b className="text-warn">age {depletionAge}</b> —{" "}
      {depletionAge !== null ? lifeExpectancy - depletionAge : 0} year
      {depletionAge !== null && lifeExpectancy - depletionAge === 1 ? "" : "s"} short of age {lifeExpectancy}.
      {hasRealProperty && depletionRowPropertyEquity !== undefined ? (
        <>
          {" "}
          At that point your property would be worth roughly{" "}
          <b className="text-accent-dim">{fmtGBP(depletionRowPropertyEquity)}</b> — optional to sell if you
          needed it, not something this plan does automatically.
          {illiquidSurvived ? (
            <>
              {" "}
              Selling it would stretch the plan all the way to {lifeExpectancy}, leaving about{" "}
              <b className="text-accent-dim">{fmtGBP(illiquidFinalTotal ?? 0)}</b>.
            </>
          ) : illiquidDepletionAge ? (
            <> Even selling it, the plan would still run out around age {illiquidDepletionAge}.</>
          ) : null}
        </>
      ) : (
        <>
          {" "}
          You haven&apos;t included a property in this plan — if you own one, adding it in the Property
          section could extend this by letting you sell it as a last resort.
        </>
      )}
    </p>
  );
}
