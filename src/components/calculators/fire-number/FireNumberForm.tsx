"use client";

import type { FireNumberInputs } from "@/lib/fire-engine/fire-number";
import { PENSION_ACCESS_AGE, mortgageBalanceAt } from "@/lib/fire-engine/fire-number";
import { fmtGBP, toPercentInput, fromPercentInput } from "@/lib/format";
import { Card, CardHeading } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { Toggle } from "@/components/ui/Toggle";
import { RadioGroup } from "@/components/ui/RadioGroup";

export interface FireNumberFormProps {
  state: FireNumberInputs;
  onChange: (patch: Partial<FireNumberInputs>) => void;
}

export function FireNumberForm({ state, onChange }: FireNumberFormProps) {
  const yearsToRetirement = Math.max(0, state.retireAge - state.currentAge);
  const debtAtRetirement = state.hasDebt
    ? mortgageBalanceAt(state.debtToday, state.debtRate, state.debtTerm, yearsToRetirement)
    : 0;
  const debtYears = Math.max(0, state.debtTerm - yearsToRetirement);
  const totalAssets = state.cash + state.isa + state.gia + state.pension;
  const pensionLocked = state.pension > 0 && state.retireAge < PENSION_ACCESS_AGE;
  const horizon = Math.max(0, state.lifeExpectancy - state.retireAge);

  return (
    <div>
      <Card>
        <CardHeading>You & your target age</CardHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField label="Current age" value={state.currentAge} onChange={(v) => onChange({ currentAge: v })} />
          <NumberField
            label="Desired retirement age"
            value={state.retireAge}
            onChange={(v) => onChange({ retireAge: v })}
          />
          <NumberField
            label="Life expectancy"
            value={state.lifeExpectancy}
            onChange={(v) => onChange({ lifeExpectancy: v })}
            info="Shapes the whole chart below and the verdict at the top — how far the projection actually runs."
          />
        </div>
      </Card>

      <Card>
        <CardHeading>What retirement will cost</CardHeading>
        <NumberField
          label="Annual living costs after retirement"
          value={state.spend}
          step={500}
          min={0}
          onChange={(v) => onChange({ spend: v })}
        />

        <div className="mt-2.5">
          <Toggle
            label="Do you have a mortgage or loan?"
            checked={state.hasDebt}
            onChange={(v) => onChange({ hasDebt: v, debtToday: v ? state.debtToday : 0 })}
          />
        </div>

        {state.hasDebt ? (
          <div className="mt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NumberField
                label="Mortgage/loan balance today"
                value={state.debtToday}
                step={1000}
                onChange={(v) => onChange({ debtToday: v })}
                info="Enter today's statement balance — we calculate what's left at retirement ourselves, using the same amortization math as the FIRE Age tool."
              />
              <NumberField
                label="Interest rate"
                value={toPercentInput(state.debtRate)}
                step={0.1}
                onChange={(v) => onChange({ debtRate: fromPercentInput(v) })}
                hint="%/yr"
              />
              <NumberField
                label="Years remaining"
                value={state.debtTerm}
                onChange={(v) => onChange({ debtTerm: v })}
              />
            </div>
            <div className="-mt-2 mb-3 rounded-lg border border-line bg-card-2 px-2.5 py-2 font-data text-[12.5px] text-accent-dim">
              = {fmtGBP(debtAtRetirement)} remaining at retirement (age {state.retireAge})
            </div>

            <div className="mb-1.5 font-heading text-xs font-medium text-text-muted">How is the balance cleared?</div>
            <RadioGroup
              name="debtMode"
              value={state.debtMode}
              onChange={(v) => onChange({ debtMode: v })}
              options={[
                { value: "lump", title: "One lump sum at retirement", subtitle: "Default — e.g. a pension tax-free lump sum." },
                { value: "gradual", title: "Paid down gradually in retirement", subtitle: "An ongoing repayment, closer to a real mortgage." },
              ]}
            />
            {state.debtMode === "gradual" ? (
              <div className="rounded-lg border border-line bg-card-2 px-2.5 py-2 font-data text-[12.5px] text-accent-dim">
                Cleared over {Math.round(debtYears)} more year{Math.round(debtYears) === 1 ? "" : "s"} after
                retirement
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card>
        <CardHeading>What you&apos;ve already got</CardHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberField label="Cash" value={state.cash} step={1000} onChange={(v) => onChange({ cash: v })} />
          <NumberField label="ISA" value={state.isa} step={1000} onChange={(v) => onChange({ isa: v })} />
          <NumberField
            label="GIA"
            value={state.gia}
            step={1000}
            onChange={(v) => onChange({ gia: v })}
            info="GIA = General Investment Account, everything outside a pension or ISA. All four grow at the same rate for simplicity, but pension stays separate when it comes to spending it."
          />
          <NumberField label="Pension" value={state.pension} step={1000} onChange={(v) => onChange({ pension: v })} />
        </div>
        <div className="-mt-1 mb-3 rounded-lg border border-line bg-card-2 px-2.5 py-2 font-data text-[12.5px] text-accent-dim">
          Total today: {fmtGBP(totalAssets)}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Growth rate (real)"
            value={toPercentInput(state.growth)}
            step={0.1}
            onChange={(v) => onChange({ growth: fromPercentInput(v) })}
            hint="%/yr above inflation"
          />
          <div className="mb-3">
            <label className="mb-1.5 flex items-center font-heading text-xs font-medium text-text-muted">
              Withdrawal rate
            </label>
            <select
              value={state.swr}
              onChange={(e) => onChange({ swr: Number(e.target.value) })}
              className="w-full rounded-lg border border-line-strong bg-bg px-2.5 py-2 font-body text-[13.5px] text-ink"
            >
              <option value={0.025}>2.5% — very conservative</option>
              <option value={0.03}>3.0% — conservative</option>
              <option value={0.035}>3.5% — moderate</option>
              <option value={0.04}>4.0% — classic rule</option>
              <option value={0.05}>5.0% — aggressive</option>
            </select>
            <div className="mt-1 text-[11px] text-text-faint">
              {horizon > 40 && state.swr >= 0.04
                ? `A ~${horizon}-year horizon is longer than the ~30 years the 4% rule assumes — consider 3–3.5% instead.`
                : horizon > 40
                  ? `A ~${horizon}-year horizon is longer than the classic 4% rule assumes — your lower rate gives margin for that.`
                  : `A ~${horizon}-year horizon is close to what the classic 4% rule was designed for.`}
            </div>
          </div>
        </div>
        {pensionLocked ? (
          <div className="mb-1 rounded-[10px] border border-warn bg-warn-soft p-3 text-[12.5px] text-[#8a3d32]">
            Retiring at {state.retireAge}, before the UK pension access age of {PENSION_ACCESS_AGE}, your{" "}
            {fmtGBP(state.pension)} pension is locked until then. Your cash, ISA, and GIA need to bridge the
            gap on their own.
          </div>
        ) : null}
      </Card>

      <Card>
        <CardHeading>
          Property <span className="font-normal text-text-faint">(optional)</span>
        </CardHeading>
        <p className="-mt-1 mb-3 text-[12.5px] text-text-muted">
          Any mortgage or loan is already captured above and reduces your Quick Target. This section
          is just about the property itself — what happens if you&apos;re willing to sell it.
        </p>
        <Toggle
          label="Do you own property?"
          checked={state.hasProperty}
          onChange={(v) => onChange({ hasProperty: v, property: v ? state.property : 0 })}
        />
        {state.hasProperty ? (
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="Property value"
              value={state.property}
              step={5000}
              onChange={(v) => onChange({ property: v })}
              info="The property's value, not counted in your main target — shows what happens if you're willing to sell it. Any mortgage against it is handled separately, above."
            />
            <NumberField
              label="Appreciation (real)"
              value={toPercentInput(state.propGrowth)}
              step={0.5}
              onChange={(v) => onChange({ propGrowth: fromPercentInput(v) })}
              hint="%/yr, typically low"
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
