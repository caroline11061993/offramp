import { PENSION_ACCESS_AGE } from "./constants";
import type { DebtClearMode } from "./types";

export { PENSION_ACCESS_AGE };

export interface FireNumberInputs {
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  /** Annual living costs after retirement, today's £ — this whole engine is REAL-terms
   *  throughout, no inflation factor anywhere (unlike fire-age.ts). */
  spend: number;

  hasDebt: boolean;
  debtToday: number;
  debtRate: number; // decimal nominal rate, used only inside mortgageBalanceAt's amortization
  debtTerm: number; // years remaining as of today
  debtMode: DebtClearMode;

  cash: number;
  isa: number;
  gia: number;
  pension: number;
  growth: number; // decimal REAL rate ("above inflation"), applied identically to liquid + pension
  swr: number; // decimal, e.g. 0.035

  hasProperty: boolean;
  property: number; // today's value
  propGrowth: number; // decimal REAL rate
}

export interface ProjectPathRow {
  age: number;
  liquid: number;
  pension: number;
  balance: number;
}

export interface ProjectPathResult {
  rows: ProjectPathRow[];
  depletionAge: number | null;
  finalBalance: number;
}

/** Projects a lump-sum mortgage/loan balance forward by yearsElapsed using monthly amortization. */
export function mortgageBalanceAt(
  todayBalance: number,
  annualRate: number,
  termYearsRemaining: number,
  yearsElapsed: number,
): number {
  if (todayBalance <= 0 || termYearsRemaining <= 0) return 0;
  if (yearsElapsed <= 0) return todayBalance;
  if (yearsElapsed >= termYearsRemaining) return 0;

  const monthlyRate = annualRate / 12;
  const nMonths = termYearsRemaining * 12;
  const monthlyPayment =
    monthlyRate === 0
      ? todayBalance / nMonths
      : (todayBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -nMonths));

  let balance = todayBalance;
  const monthsElapsed = Math.round(yearsElapsed * 12);
  for (let m = 0; m < monthsElapsed && balance > 0; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance = Math.max(0, balance - principal);
  }
  return balance;
}

/**
 * Compounds liquid + pension pots monthly from `age` to `retireAge` (with monthlySaving
 * added to liquid only), clears `debtAtRetirement` as a lump sum at retireAge
 * (debtMode='lump') or spreads it as a straight-line extra outflow of
 * debtAtRetirement/debtYears per year post-retirement (debtMode='gradual'), adds
 * `propertyAddAtRetirement` to liquid at retireAge, then draws `spend` (+ any gradual
 * debt repayment) per year from liquid first, then pension once age >= pensionAccessAge.
 */
export function projectPath(
  startLiquid: number,
  startPension: number,
  monthlySaving: number,
  age: number,
  retireAge: number,
  lifeExpectancy: number,
  growth: number,
  spend: number,
  debtAtRetirement: number,
  propertyAddAtRetirement: number,
  pensionAccessAge: number,
  debtMode: DebtClearMode,
  debtYears: number,
): ProjectPathResult {
  let liquid = startLiquid;
  let pension = startPension;
  const rows: ProjectPathRow[] = [{ age, liquid, pension, balance: liquid + pension }];
  const monthlyRate = Math.pow(1 + growth, 1 / 12) - 1;

  for (let a = age + 1; a <= retireAge; a++) {
    for (let m = 0; m < 12; m++) {
      liquid = liquid * (1 + monthlyRate) + monthlySaving;
      pension = pension * (1 + monthlyRate);
    }
    rows.push({ age: a, liquid, pension, balance: liquid + pension });
  }

  // Lump-sum debt payoff and property both hit the liquid pot, never pension — only in lump mode.
  const lumpDebt = debtMode === "gradual" ? 0 : debtAtRetirement;
  liquid = Math.max(0, liquid - lumpDebt + (propertyAddAtRetirement || 0));
  rows[rows.length - 1].liquid = liquid;
  rows[rows.length - 1].balance = liquid + pension;

  const annualDebtRepayment =
    debtMode === "gradual" && debtYears > 0 ? debtAtRetirement / debtYears : 0;

  let depletionAge: number | null = null;
  for (let a = retireAge + 1; a <= lifeExpectancy; a++) {
    liquid = liquid * (1 + growth);
    pension = pension * (1 + growth);
    const yearsSinceRetirement = a - retireAge;
    const debtThisYear =
      debtMode === "gradual" && yearsSinceRetirement <= debtYears ? annualDebtRepayment : 0;
    let required = spend + debtThisYear;

    const fromLiquid = Math.min(liquid, required);
    liquid -= fromLiquid;
    required -= fromLiquid;

    if (required > 0 && a >= pensionAccessAge) {
      const fromPension = Math.min(pension, required);
      pension -= fromPension;
      required -= fromPension;
    }

    if (required > 0.5) {
      if (depletionAge === null) depletionAge = a;
      liquid = Math.max(0, liquid);
    }
    rows.push({ age: a, liquid, pension, balance: liquid + pension });
  }

  return { rows, depletionAge, finalBalance: liquid + pension };
}

export type FireNumberVerdict =
  | { kind: "noRetirementWindow" } // retireAge <= currentAge
  | { kind: "indeterminate" } // years>0 but lifeExpectancy <= retireAge — paths never computed
  | { kind: "onTrack"; finalBalance: number }
  | { kind: "saveToFix"; monthlySaving: number; noSaveDepletionAge: number }
  | { kind: "short"; monthlySaving: number; depletionAge: number };

export interface FireNumberResult {
  debtAtRetirement: number; // mortgageBalanceAt(...) projected to retireAge
  debtYears: number; // max(0, debtTerm - yearsToRetirement)
  totalAssets: number; // cash+isa+gia+pension today
  pensionLocked: boolean; // pension>0 && retireAge < PENSION_ACCESS_AGE
  horizon: number; // lifeExpectancy - retireAge
  fireNumber: number; // spend/swr + debtAtRetirement
  fvAssets: number; // totalAssets * (1+growth)^years
  gap: number; // fireNumber - fvAssets
  monthlySaving: number; // recommended saving, no-property scenario
  monthlySavingWithProperty: number;
  propertyFutureValue: number; // property * (1+propGrowth)^years
  usingProperty: boolean; // property > 0
  altRetireAge: number; // retireAge + 5
  altMonthlySaving: number; // monthly saving needed if retiring 5 years later
  verdict: FireNumberVerdict;
  paths: {
    noSaveNoProp: ProjectPathResult | null;
    saveNoProp: ProjectPathResult | null;
    noSaveWithProp: ProjectPathResult | null; // null unless usingProperty
    saveWithProp: ProjectPathResult | null; // null unless usingProperty
  };
}

function annuityPayment(gap: number, growth: number, years: number): number {
  if (years <= 0 || gap <= 0) return 0;
  const monthlyRate = Math.pow(1 + growth, 1 / 12) - 1;
  const nMonths = years * 12;
  return monthlyRate === 0 ? gap / nMonths : (gap * monthlyRate) / (Math.pow(1 + monthlyRate, nMonths) - 1);
}

/**
 * Pure orchestrator — mirrors the source's calcFireNumber() minus all DOM writes. The
 * property-sell chart toggle is UI state, not calc state, so it is NOT baked in here:
 * all four `paths` are always computed, and the component picks which pair to render
 * based on that toggle's local state.
 */
export function calcFireNumber(inp: FireNumberInputs): FireNumberResult {
  const yearsToRetirement = Math.max(0, inp.retireAge - inp.currentAge);
  const debtAtRetirement = inp.hasDebt
    ? mortgageBalanceAt(inp.debtToday, inp.debtRate, inp.debtTerm, yearsToRetirement)
    : 0;
  const debtYears = Math.max(0, inp.debtTerm - yearsToRetirement);

  const totalAssets = inp.cash + inp.isa + inp.gia + inp.pension;
  const pensionLocked = inp.pension > 0 && inp.retireAge < PENSION_ACCESS_AGE;
  const horizon = Math.max(0, inp.lifeExpectancy - inp.retireAge);

  const years = Math.max(0, inp.retireAge - inp.currentAge);
  const fireNumber = inp.spend / inp.swr + debtAtRetirement;
  const fvAssets = totalAssets * Math.pow(1 + inp.growth, years);
  const gap = fireNumber - fvAssets;
  const monthlySaving = annuityPayment(gap, inp.growth, years);

  const usingProperty = inp.hasProperty && inp.property > 0;
  const liquidAssets = inp.cash + inp.isa + inp.gia;

  let pathNoSaveNoProp: ProjectPathResult | null = null;
  let pathSaveNoProp: ProjectPathResult | null = null;
  let pathNoSaveWithProp: ProjectPathResult | null = null;
  let pathSaveWithProp: ProjectPathResult | null = null;
  let monthlySavingWithProperty = 0;
  let propertyFutureValue = 0;

  if (years > 0 && inp.lifeExpectancy > inp.retireAge) {
    pathNoSaveNoProp = projectPath(
      liquidAssets,
      inp.pension,
      0,
      inp.currentAge,
      inp.retireAge,
      inp.lifeExpectancy,
      inp.growth,
      inp.spend,
      debtAtRetirement,
      0,
      PENSION_ACCESS_AGE,
      inp.debtMode,
      debtYears,
    );
    pathSaveNoProp = projectPath(
      liquidAssets,
      inp.pension,
      monthlySaving,
      inp.currentAge,
      inp.retireAge,
      inp.lifeExpectancy,
      inp.growth,
      inp.spend,
      debtAtRetirement,
      0,
      PENSION_ACCESS_AGE,
      inp.debtMode,
      debtYears,
    );

    if (usingProperty) {
      propertyFutureValue = inp.property * Math.pow(1 + inp.propGrowth, years);
      const gapIncl = fireNumber - (fvAssets + propertyFutureValue);
      monthlySavingWithProperty = annuityPayment(gapIncl, inp.growth, years);

      pathNoSaveWithProp = projectPath(
        liquidAssets,
        inp.pension,
        0,
        inp.currentAge,
        inp.retireAge,
        inp.lifeExpectancy,
        inp.growth,
        inp.spend,
        debtAtRetirement,
        propertyFutureValue,
        PENSION_ACCESS_AGE,
        inp.debtMode,
        debtYears,
      );
      pathSaveWithProp = projectPath(
        liquidAssets,
        inp.pension,
        monthlySavingWithProperty,
        inp.currentAge,
        inp.retireAge,
        inp.lifeExpectancy,
        inp.growth,
        inp.spend,
        debtAtRetirement,
        propertyFutureValue,
        PENSION_ACCESS_AGE,
        inp.debtMode,
        debtYears,
      );
    }
  }

  let verdict: FireNumberVerdict;
  if (years <= 0) {
    verdict = { kind: "noRetirementWindow" };
  } else if (pathNoSaveNoProp && !pathNoSaveNoProp.depletionAge) {
    verdict = { kind: "onTrack", finalBalance: pathNoSaveNoProp.finalBalance };
  } else if (pathSaveNoProp && !pathSaveNoProp.depletionAge) {
    verdict = {
      kind: "saveToFix",
      monthlySaving,
      noSaveDepletionAge: pathNoSaveNoProp!.depletionAge as number,
    };
  } else if (pathNoSaveNoProp) {
    const shortAge = pathSaveNoProp
      ? (pathSaveNoProp.depletionAge as number)
      : (pathNoSaveNoProp.depletionAge as number);
    verdict = { kind: "short", monthlySaving, depletionAge: shortAge };
  } else {
    verdict = { kind: "indeterminate" };
  }

  const altRetireAge = inp.retireAge + 5;
  const altYears = altRetireAge - inp.currentAge;
  const altFvAssets = totalAssets * Math.pow(1 + inp.growth, altYears);
  const altGap = fireNumber - altFvAssets;
  const altMonthlySaving = annuityPayment(altGap, inp.growth, altYears);

  return {
    debtAtRetirement,
    debtYears,
    totalAssets,
    pensionLocked,
    horizon,
    fireNumber,
    fvAssets,
    gap,
    monthlySaving,
    monthlySavingWithProperty,
    propertyFutureValue,
    usingProperty,
    altRetireAge,
    altMonthlySaving,
    verdict,
    paths: {
      noSaveNoProp: pathNoSaveNoProp,
      saveNoProp: pathSaveNoProp,
      noSaveWithProp: pathNoSaveWithProp,
      saveWithProp: pathSaveWithProp,
    },
  };
}
