"use client";

import { useMemo, useState } from "react";
import { calcTax } from "@/lib/fire-engine/tax";
import type { FireAgeFormState } from "@/lib/url-state/fire-age-codec";
import { fmtGBP, toPercentInput, fromPercentInput } from "@/lib/format";
import { NumberField } from "@/components/ui/NumberField";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { AccordionSection } from "@/components/calculators/shared/AccordionSection";

export interface FireAgeFormProps {
  state: FireAgeFormState;
  onChange: (patch: Partial<FireAgeFormState>) => void;
  onSubmit: () => void;
}

export function FireAgeForm({ state, onChange, onSubmit }: FireAgeFormProps) {
  const [openSection, setOpenSection] = useState(1);
  const [done, setDone] = useState<Set<number>>(new Set());

  const takeHome = useMemo(() => {
    const taxableSalary = state.salSacrifice
      ? Math.max(0, state.salary0 - state.pensionContribM * 12)
      : state.salary0;
    return calcTax(taxableSalary).takeHome;
  }, [state.salary0, state.salSacrifice, state.pensionContribM]);

  const markDone = (idx: number, next: number) => {
    setDone((prev) => new Set(prev).add(idx));
    setOpenSection(next);
  };

  return (
    <div>
      <Card>
        <div className="mb-0.5 font-heading text-[14.5px] font-semibold text-ink">You, today</div>
        <div className="mb-3.5 text-xs text-text-muted">The starting point for the whole projection.</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField
            label="Current age"
            value={state.currentAge}
            onChange={(v) => onChange({ currentAge: v })}
          />
          <NumberField
            label="Life expectancy"
            value={state.lifeExpectancy}
            onChange={(v) => onChange({ lifeExpectancy: v })}
          />
          <NumberField
            label="Inflation"
            value={toPercentInput(state.inflation)}
            step={0.1}
            onChange={(v) => onChange({ inflation: fromPercentInput(v) })}
            hint="%/yr"
            info="Shown in today's money throughout, but inflation still matters: your mortgage payment is fixed in future pounds, and UK tax bands don't rise with prices. 2% is the Bank of England's long-term target."
          />
        </div>
      </Card>

      <AccordionSection
        index={1}
        title="Your income & assets"
        subtitle="Salary, savings, pension, and what they'll grow into."
        summary={`${fmtGBP(state.salary0)}/yr salary · ${fmtGBP(
          state.cash0 + state.isa0 + state.gia0 + state.lisa0 + state.pension0,
        )} saved so far`}
        done={done.has(1)}
        open={openSection === 1}
        onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)}
      >
        <div className="mb-3 border-t-0 pt-0 font-heading text-[12.5px] font-semibold uppercase tracking-wide text-accent-dim">
          Salary
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Gross annual salary"
            value={state.salary0}
            step={1000}
            onChange={(v) => onChange({ salary0: v })}
            info="Converted to real take-home pay using UK income tax and National Insurance bands, so whatever's left funds your saving."
          />
          <div className="mb-3">
            <div className="mb-1.5 font-heading text-xs font-medium text-text-muted">Take-home pay</div>
            <div className="w-full rounded-lg border border-line-strong bg-bg px-2.5 py-2 font-data text-[13.5px] text-ink opacity-65">
              {fmtGBP(takeHome)}/yr
            </div>
          </div>
        </div>

        <SubHeading>Cash</SubHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField label="Cash balance" value={state.cash0} step={1000} onChange={(v) => onChange({ cash0: v })} />
          <NumberField
            label="Cash return"
            value={toPercentInput(state.cashReturn)}
            step={0.1}
            onChange={(v) => onChange({ cashReturn: fromPercentInput(v) })}
            hint="%/yr above inflation"
          />
        </div>

        <SubHeading>ISA & GIA</SubHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField label="ISA balance" value={state.isa0} step={1000} onChange={(v) => onChange({ isa0: v })} />
          <NumberField label="GIA balance" value={state.gia0} step={1000} onChange={(v) => onChange({ gia0: v })} />
        </div>
        <NumberField
          label="Growth rate"
          value={toPercentInput(state.growth)}
          step={0.1}
          onChange={(v) => onChange({ growth: fromPercentInput(v) })}
          hint="%/yr, before inflation"
          info="Entered before inflation is subtracted out — a nominal rate. At 2% inflation, 6.5% works out to roughly 4.5% once inflation is subtracted. One rate applies throughout, working and retired, rather than de-risking automatically at retirement. Also used for your LISA below."
        />

        <SubHeading>LISA (Lifetime ISA)</SubHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField label="LISA balance" value={state.lisa0} step={500} onChange={(v) => onChange({ lisa0: v })} />
          <NumberField
            label="Monthly contribution"
            value={state.lisaContribM}
            step={50}
            onChange={(v) => onChange({ lisaContribM: v })}
            info="The government adds a 25% bonus on top, up to £4,000 of contributions a year (£333/month) — anything you pay in above that still goes in, just without the bonus on the excess. Contributions (and the bonus) stop the year you turn 50. Locked from withdrawal until 60 — this calculator doesn't model using a LISA to buy a first home."
          />
        </div>

        <SubHeading>Pension / SIPP</SubHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Current balance"
            value={state.pension0}
            step={1000}
            onChange={(v) => onChange({ pension0: v })}
          />
          <NumberField
            label="Monthly contribution"
            value={state.pensionContribM}
            step={50}
            onChange={(v) => onChange({ pensionContribM: v })}
            info="You + employer combined. If you retire before your access age, the plan checks your other accounts can bridge the gap."
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Access age"
            value={state.pensionAccess}
            onChange={(v) => onChange({ pensionAccess: v })}
            info="Currently 55, rising to 57 in 2028 — the earliest UK age you can normally draw a private pension. 57 is a safe default if you're unsure."
          />
          <div>
            <label className="mb-1.5 flex items-center font-heading text-xs font-medium text-text-muted">
              Salary sacrifice?
            </label>
            <select
              value={state.salSacrifice ? "1" : "0"}
              onChange={(e) => onChange({ salSacrifice: e.target.value === "1" })}
              className="w-full rounded-lg border border-line-strong bg-bg px-2.5 py-2 font-body text-[13.5px] text-ink"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>
        <NumberField
          label="Growth rate"
          value={toPercentInput(state.pensionGrowth)}
          step={0.1}
          onChange={(v) => onChange({ pensionGrowth: fromPercentInput(v) })}
          hint="%/yr, before inflation"
        />

        <SubHeading>State Pension</SubHeading>
        <Toggle label="Include State Pension" checked={state.spOn} onChange={(v) => onChange({ spOn: v })} />
        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${state.spOn ? "" : "opacity-40"}`}>
          <NumberField label="State Pension age" value={state.spAge} onChange={(v) => onChange({ spAge: v })} />
          <NumberField
            label="Annual amount"
            value={state.spAmount0}
            step={100}
            onChange={(v) => onChange({ spAmount0: v })}
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => markDone(1, 2)}
            className="rounded-lg bg-accent px-4.5 py-2 font-heading text-[12.5px] font-semibold text-white shadow hover:bg-accent-dim"
          >
            Continue
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        index={2}
        title="Spending & living costs"
        subtitle="What retirement actually needs to fund."
        summary={`${fmtGBP(state.spend0)}/yr`}
        done={done.has(2)}
        open={openSection === 2}
        onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
      >
        <NumberField
          label="Annual living expenses"
          value={state.spend0}
          step={500}
          onChange={(v) => onChange({ spend0: v })}
          info="Excludes mortgage — that's handled in the next section, since it usually disappears partway through retirement."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField label="Care costs start at age" value={state.careAge} onChange={(v) => onChange({ careAge: v })} />
          <NumberField
            label="Extra increase"
            value={toPercentInput(state.careRate)}
            step={0.5}
            onChange={(v) => onChange({ careRate: fromPercentInput(v) })}
            hint="%/yr on top of inflation"
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => markDone(2, 3)}
            className="rounded-lg bg-accent px-4.5 py-2 font-heading text-[12.5px] font-semibold text-white shadow hover:bg-accent-dim"
          >
            Continue
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        index={3}
        title="Property, loans & mortgage"
        subtitle="Competes with spending until paid off."
        summary={state.hasProperty ? `${fmtGBP(state.propValue0)} property, ${fmtGBP(state.mortgageBal0)} mortgage` : "No property or loans"}
        done={done.has(3)}
        open={openSection === 3}
        onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
      >
        <Toggle label="Do you own property?" checked={state.hasProperty} onChange={(v) => onChange({ hasProperty: v })} />
        {state.hasProperty ? (
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberField
                label="Property value"
                value={state.propValue0}
                step={5000}
                onChange={(v) => onChange({ propValue0: v })}
              />
              <NumberField
                label="Mortgage / loan remaining"
                value={state.mortgageBal0}
                step={5000}
                onChange={(v) => onChange({ mortgageBal0: v })}
                hint="mortgage, or any other major loan"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NumberField
                label="Rate"
                value={toPercentInput(state.mortgageRate)}
                step={0.1}
                onChange={(v) => onChange({ mortgageRate: fromPercentInput(v) })}
                hint="%/yr"
              />
              <NumberField
                label="Term remaining"
                value={state.mortgageTerm}
                onChange={(v) => onChange({ mortgageTerm: v })}
                hint="years"
              />
              <NumberField
                label="Appreciation"
                value={toPercentInput(state.propAppreciation)}
                step={0.5}
                onChange={(v) => onChange({ propAppreciation: fromPercentInput(v) })}
                hint="%/yr real"
                info="UK house prices have historically grown roughly in line with inflation over the long run — 1% real is a conservative default, not a forecast."
              />
            </div>
          </div>
        ) : null}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              setDone((prev) => new Set(prev).add(3));
              onSubmit();
            }}
            className="rounded-lg bg-accent px-4.5 py-2 font-heading text-[12.5px] font-semibold text-white shadow hover:bg-accent-dim"
          >
            See my plan
          </button>
        </div>
      </AccordionSection>
    </div>
  );
}

function SubHeading({ children }: { children: string }) {
  return (
    <div className="mb-2.5 mt-5 border-t border-dashed border-line pt-4 font-heading text-[12.5px] font-semibold uppercase tracking-wide text-accent-dim first:mt-3.5 first:border-t-0 first:pt-0">
      {children}
    </div>
  );
}
