"use client";

import { useMemo, useState } from "react";
import { calcFireNumber, type FireNumberInputs } from "@/lib/fire-engine/fire-number";
import { fmtGBP } from "@/lib/format";
import { ResultHero } from "@/components/calculators/shared/ResultHero";
import { StatGrid } from "@/components/calculators/shared/StatGrid";
import { Toggle } from "@/components/ui/Toggle";
import { FireNumberChart } from "./FireNumberChart";
import { RecommendationModule } from "@/components/monetization/RecommendationModule";
import { AdSlot } from "@/components/monetization/AdSlot";
import { ProductCTA } from "@/components/ProductCTA";

export function FireNumberResults({ state }: { state: FireNumberInputs }) {
  const result = useMemo(() => calcFireNumber(state), [state]);
  const [includeProperty, setIncludeProperty] = useState(false);

  const toggleOn = result.usingProperty && includeProperty;
  const pathA = toggleOn ? result.paths.noSaveWithProp : result.paths.noSaveNoProp;
  const pathB = toggleOn ? result.paths.saveWithProp : result.paths.saveNoProp;
  const amountB = toggleOn ? result.monthlySavingWithProperty : result.monthlySaving;
  const linesIdentical = amountB === 0;

  const verdict = result.verdict;

  return (
    <div>
      <ResultHero
        label="The real verdict, accounting for life expectancy"
        value={
          verdict.kind === "noRetirementWindow" || verdict.kind === "indeterminate"
            ? "—"
            : verdict.kind === "onTrack"
              ? "On track"
              : verdict.kind === "saveToFix"
                ? `Save ${fmtGBP(verdict.monthlySaving)}/mo`
                : `Short — runs out at ${verdict.depletionAge}`
        }
        tone={verdict.kind === "short" ? "warn" : "accent"}
        sub={
          verdict.kind === "noRetirementWindow"
            ? "Set a retirement age after your current age to see this."
            : verdict.kind === "onTrack"
              ? `Retiring at ${state.retireAge} and living to ${state.lifeExpectancy}, your current trajectory holds up without saving anything more — projected to leave roughly ${fmtGBP(verdict.finalBalance)}.`
              : verdict.kind === "saveToFix"
                ? `Retiring at ${state.retireAge} and living to ${state.lifeExpectancy} works — but only if you save roughly that much between now and then. On your current trajectory alone, it runs out around age ${verdict.noSaveDepletionAge}.`
                : verdict.kind === "short"
                  ? `Even saving ${fmtGBP(verdict.monthlySaving)}/mo, retiring at ${state.retireAge} doesn't stretch to age ${state.lifeExpectancy} on these numbers${result.usingProperty ? " — try the property toggle further down to see if that changes the picture" : " — consider a later retirement age, lower spending, or a lower withdrawal rate"}.`
                  : ""
        }
      />

      {verdict.kind !== "noRetirementWindow" && verdict.kind !== "indeterminate" ? (
        <div className="mt-4">
          <ProductCTA slug="budget-planner" />
        </div>
      ) : null}

      <div className="mb-1 mt-6 font-data text-[11px] uppercase tracking-wide text-accent-dim">
        Quick rule of thumb
      </div>
      <p className="mt-0 text-[12.5px] text-text-muted">
        A withdrawal-rate estimate, not a simulation — doesn&apos;t check life expectancy or pension timing.
      </p>
      <StatGrid
        stats={[
          { label: "Quick target", value: fmtGBP(result.fireNumber), hint: "= spend ÷ withdrawal rate, + debt" },
          {
            label: `Projected by age ${state.retireAge}`,
            value: fmtGBP(result.fvAssets),
            hint: "Cash+ISA+GIA+pension, no further saving",
          },
          { label: "Gap to close", value: fmtGBP(Math.max(0, result.gap)), hint: "Target minus projected" },
        ]}
      />

      <ResultHero
        label="Monthly saving needed to close the gap"
        value={result.gap <= 0 || state.retireAge <= state.currentAge ? "£0/mo" : `${fmtGBP(result.monthlySaving)}/mo`}
        sub={
          state.retireAge <= state.currentAge
            ? "Set a retirement age after your current age to see this."
            : result.gap <= 0
              ? `You're already on track without saving anything more, based on ${fmtGBP(result.totalAssets)} growing at ${(state.growth * 100).toFixed(1)}% real.`
              : `To close a ${fmtGBP(result.gap)} gap by age ${state.retireAge}. Feels steep? Retiring 5 years later at ${result.altRetireAge} needs roughly ${fmtGBP(result.altMonthlySaving)}/mo instead.`
        }
      />

      <div className="mb-3 mt-6 font-data text-[11px] uppercase tracking-wide text-accent-dim">
        What this looks like to age {state.lifeExpectancy}
      </div>

      {result.usingProperty ? (
        <div className="mb-4 rounded-[var(--radius-token)] border border-line bg-card p-4 shadow-sm">
          <Toggle
            label="Include selling property"
            checked={includeProperty}
            onChange={setIncludeProperty}
            description="Off: keep the property. On: sell it and add proceeds at retirement."
          />
        </div>
      ) : null}

      {pathA ? (
        <div className="mb-1.5 rounded-[var(--radius-token)] border border-line bg-card p-3.5 shadow-sm">
          <FireNumberChart
            pathNoSaving={pathA}
            pathPlan={linesIdentical ? null : pathB}
            retireAge={state.retireAge}
            debtAtRetirement={state.debtMode === "lump" ? result.debtAtRetirement : 0}
          />
          <div className="mt-2 flex flex-col gap-1.5 text-[11px] text-text-muted">
            {linesIdentical ? (
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-warn" />
                Save nothing more (£0/mo){toggleOn ? " + sell property" : ""} — you&apos;re already on track,
                so there&apos;s just one line
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-warn" />
                  Save nothing more (£0/mo){toggleOn ? " + sell property" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block h-0.5 w-3.5 bg-accent" />
                  Save {fmtGBP(amountB)}/mo{toggleOn ? " + sell property" : ""} — closes your gap
                </span>
              </>
            )}
          </div>
        </div>
      ) : null}

      <ChartWarnings
        debt={result.debtAtRetirement}
        debtMode={state.debtMode}
        debtYears={result.debtYears}
        linesIdentical={linesIdentical}
        pathA={pathA}
        pathB={linesIdentical ? null : pathB}
        amountB={amountB}
        toggleOn={toggleOn}
        lifeExpectancy={state.lifeExpectancy}
        growth={state.growth}
        swr={state.swr}
        spend={state.spend}
        retireAge={state.retireAge}
      />

      {pathA ? (
        <StatGrid
          stats={
            linesIdentical
              ? [
                  {
                    label: `Save nothing more, at ${state.lifeExpectancy}${toggleOn ? " (incl. property)" : ""}`,
                    value: pathA.depletionAge ? `Runs out at ${pathA.depletionAge}` : `${fmtGBP(pathA.finalBalance)} left`,
                    color: "var(--warn)",
                  },
                ]
              : pathB
                ? [
                    {
                      label: `Save nothing more, at ${state.lifeExpectancy}${toggleOn ? " (incl. property)" : ""}`,
                      value: pathA.depletionAge ? `Runs out at ${pathA.depletionAge}` : `${fmtGBP(pathA.finalBalance)} left`,
                      color: "var(--warn)",
                    },
                    {
                      label: `Save ${fmtGBP(amountB)}/mo, at ${state.lifeExpectancy}${toggleOn ? " (incl. property)" : ""}`,
                      value: pathB.depletionAge ? `Runs out at ${pathB.depletionAge}` : `${fmtGBP(pathB.finalBalance)} left`,
                      color: "var(--accent)",
                    },
                  ]
                : []
          }
        />
      ) : null}

      <p className="mt-1 text-[12px] text-text-faint">
        Always shows monthly saving with and without property, regardless of the toggle above.
      </p>
      {result.usingProperty && state.retireAge > state.currentAge ? (
        <>
          <StatGrid
            stats={[
              { label: "Saving needed, no property", value: `${fmtGBP(result.monthlySaving)}/mo` },
              { label: "Saving needed, incl. property", value: `${fmtGBP(result.monthlySavingWithProperty)}/mo` },
              {
                label: "Difference",
                value: `${fmtGBP(Math.max(0, result.monthlySaving - result.monthlySavingWithProperty))}/mo less`,
              },
            ]}
          />
          <div className="mb-3 rounded-[10px] border border-line-strong bg-card-2 p-3 text-[12.5px] text-text-muted">
            Your property is projected to be worth roughly {fmtGBP(result.propertyFutureValue)} by age{" "}
            {state.retireAge}. The toggle above the chart shows how selling it reduces the saving you need.
          </div>
        </>
      ) : null}

      <div className="mb-4 rounded-[10px] border border-line-strong bg-card-2 p-3 text-[12.5px] text-text-muted">
        Treats growth and saving as perfectly steady, ignores UK tax — a quick illustration. For the full
        picture, use FIRE Age.
      </div>

      <RecommendationModule
        signal={{
          gapYearsToRetirement: state.retireAge - state.currentAge,
          yearsToTargetRetirement: state.retireAge - state.currentAge,
          planShort: verdict.kind === "short",
        }}
      />

      <div className="mt-5 flex justify-center">
        <AdSlot slotId="fire-number-results-inline" width={336} height={120} />
      </div>
    </div>
  );
}

function ChartWarnings({
  debt,
  debtMode,
  debtYears,
  linesIdentical,
  pathA,
  pathB,
  amountB,
  toggleOn,
  lifeExpectancy,
  growth,
  swr,
  spend,
  retireAge,
}: {
  debt: number;
  debtMode: "lump" | "gradual";
  debtYears: number;
  linesIdentical: boolean;
  pathA: ReturnType<typeof calcFireNumber>["paths"]["noSaveNoProp"];
  pathB: ReturnType<typeof calcFireNumber>["paths"]["saveNoProp"];
  amountB: number;
  toggleOn: boolean;
  lifeExpectancy: number;
  growth: number;
  swr: number;
  spend: number;
  retireAge: number;
}) {
  const notes: React.ReactNode[] = [];

  if (debt > 0 && debtMode === "lump") {
    notes.push(
      <Note key="lump">
        Both lines dip at your retirement age — your {fmtGBP(debt)} debt clearing as a lump sum, not a
        rendering issue.
      </Note>,
    );
  }
  if (debt > 0 && debtMode === "gradual") {
    notes.push(
      <Note key="gradual">
        Your {fmtGBP(debt)} debt is spread over {debtYears} years, adding roughly {fmtGBP(debt / debtYears)}/yr
        to spending after retirement until cleared — so no dip at the retirement marker.
      </Note>,
    );
  }
  if (linesIdentical) {
    notes.push(
      <Note key="identical">Both scenarios need £0/mo of extra saving, so there&apos;s only one line — not a glitch.</Note>,
    );
  }
  if (pathA?.depletionAge) {
    notes.push(
      <Warning key="pathA">
        If you don&apos;t save anything more{toggleOn ? ", even selling your property," : ""}, your money runs
        out around <b>age {pathA.depletionAge}</b> — {lifeExpectancy - pathA.depletionAge} years before your
        life expectancy of {lifeExpectancy}.
      </Warning>,
    );
  }
  if (!linesIdentical && pathB?.depletionAge) {
    notes.push(
      <Warning key="pathB">
        Even saving {fmtGBP(amountB)}/mo{toggleOn ? " and selling your property" : ""}, this runs out around{" "}
        <b>age {pathB.depletionAge}</b> — before your life expectancy of {lifeExpectancy}.
      </Warning>,
    );
  }
  if (!linesIdentical && pathB && !pathB.depletionAge && growth > swr) {
    const retiredRow = pathB.rows.find((r) => r.age === retireAge);
    const finalRow = pathB.rows[pathB.rows.length - 1];
    if (retiredRow && finalRow.balance > retiredRow.balance * 1.1) {
      notes.push(
        <Note key="counterintuitive">
          The solid line keeps climbing after retirement despite spending {fmtGBP(spend)}/yr — not a bug.
          Your growth assumption ({(growth * 100).toFixed(1)}%) exceeds your withdrawal rate (
          {(swr * 100).toFixed(1)}%), so this pot grows faster than it&apos;s drawn down. That&apos;s the
          safety margin, not money you&apos;re required to spend.
        </Note>,
      );
    }
  }

  if (notes.length === 0) return null;
  return <div>{notes}</div>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-[10px] border border-line-strong bg-card-2 p-3 text-[12.5px] text-text-muted">
      {children}
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
