/**
 * UK income tax + National Insurance, simplified 2025/26 bands.
 * Ported as-is from the validated prototype (uk_fire_calculator.html) — do not
 * "improve" the maths here without treating it as a deliberate, separate decision.
 */
export const UK_TAX = {
  personalAllowance: 12570,
  paTaperThreshold: 100000,
  basicRateLimit: 50270,
  higherRateLimit: 125140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  niPrimaryThreshold: 12570,
  niUpperLimit: 50270,
  niMainRate: 0.08,
  niUpperRate: 0.02,
} as const;

export interface TaxResult {
  tax: number;
  ni: number;
  takeHome: number;
}

export interface IncomeTaxOnlyResult {
  tax: number;
  takeHome: number;
}

/** Income tax bands only (no NI) — shared by calcTax and the NI-free retirement-income helpers. */
function incomeTaxBands(gross: number): number {
  if (gross <= 0) return 0;

  let pa: number = UK_TAX.personalAllowance;
  if (gross > UK_TAX.paTaperThreshold) {
    pa = Math.max(0, pa - (gross - UK_TAX.paTaperThreshold) / 2);
  }
  const taxable = Math.max(0, gross - pa);

  let tax = 0;
  const basicBand = Math.max(0, Math.min(taxable, UK_TAX.basicRateLimit - pa));
  tax += basicBand * UK_TAX.basicRate;

  const higherBand = Math.max(
    0,
    Math.min(gross - UK_TAX.basicRateLimit, UK_TAX.higherRateLimit - UK_TAX.basicRateLimit),
  );
  tax += higherBand * UK_TAX.higherRate;

  const addBand = Math.max(0, gross - UK_TAX.higherRateLimit);
  tax += addBand * UK_TAX.additionalRate;

  return tax;
}

function niOn(gross: number): number {
  if (gross <= 0) return 0;

  let ni = 0;
  const niBasic = Math.max(0, Math.min(gross, UK_TAX.niUpperLimit) - UK_TAX.niPrimaryThreshold);
  ni += niBasic * UK_TAX.niMainRate;

  const niUpper = Math.max(0, gross - UK_TAX.niUpperLimit);
  ni += niUpper * UK_TAX.niUpperRate;

  return ni;
}

/**
 * `gross`: annual gross income in £, in whatever terms (nominal or today's-£) the
 * caller is working in at the point of calling — this function is unit-agnostic,
 * it just applies UK tax bands to a single number. Includes NI — only correct for
 * earned income (salary). Retirement income (pension/DB/State Pension) isn't
 * NI-liable in the UK — use `incomeTaxOnly` for that instead.
 */
export function calcTax(gross: number): TaxResult {
  if (gross <= 0) return { tax: 0, ni: 0, takeHome: Math.max(0, gross) };
  const tax = incomeTaxBands(gross);
  const ni = niOn(gross);
  return { tax, ni, takeHome: gross - tax - ni };
}

/** Marginal tax+NI cost of an additional `extra` of (earned) income stacked on top of `baseGross`. */
export function marginalTaxOnExtra(baseGross: number, extra: number): number {
  if (extra <= 0) return 0;
  const a = calcTax(baseGross);
  const b = calcTax(baseGross + extra);
  return b.tax + b.ni - (a.tax + a.ni);
}

/**
 * Income tax only, no NI — for retirement income (pension drawdown, DB pension,
 * State Pension), none of which is NI-liable in the UK.
 */
export function incomeTaxOnly(gross: number): IncomeTaxOnlyResult {
  if (gross <= 0) return { tax: 0, takeHome: Math.max(0, gross) };
  const tax = incomeTaxBands(gross);
  return { tax, takeHome: gross - tax };
}

/** Marginal income-tax-only cost of `extra` retirement income stacked on top of `baseGross`. */
export function marginalIncomeTaxOnly(baseGross: number, extra: number): number {
  if (extra <= 0) return 0;
  return incomeTaxOnly(baseGross + extra).tax - incomeTaxOnly(baseGross).tax;
}

/**
 * Solves for the gross pension withdrawal that nets `netNeeded` after income tax, where
 * `taxFreeFraction` of the withdrawal is tax-free (UK pension commencement lump sum, taken
 * UFPLS-style pro-rata on every withdrawal rather than crystallised once) and the rest is
 * taxed as income stacked on top of `otherTaxableIncome` already received this year (e.g.
 * DB pension + State Pension, which use their own personal-allowance/band headroom first).
 * Caps at `potBalance` — if even fully draining the pot can't net `netNeeded`, drains it
 * entirely and reports however much that actually nets.
 */
export function grossUpTaxableWithdrawal(
  potBalance: number,
  netNeeded: number,
  otherTaxableIncome: number,
  taxFreeFraction: number,
): { drawn: number; net: number } {
  if (potBalance <= 0 || netNeeded <= 0) return { drawn: 0, net: 0 };

  const netOf = (gross: number) =>
    gross - marginalIncomeTaxOnly(otherTaxableIncome, gross * (1 - taxFreeFraction));

  const netAtFullDrain = netOf(potBalance);
  if (netAtFullDrain <= netNeeded) {
    return { drawn: potBalance, net: Math.max(0, netAtFullDrain) };
  }

  // netOf is monotonically increasing in gross (marginal rate is always < 100%), so bisect.
  let lo = 0;
  let hi = potBalance;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (netOf(mid) < netNeeded) lo = mid;
    else hi = mid;
  }
  return { drawn: hi, net: netOf(hi) };
}
