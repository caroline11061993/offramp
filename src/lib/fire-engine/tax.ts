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

/**
 * `gross`: annual gross income in £, in whatever terms (nominal or today's-£) the
 * caller is working in at the point of calling — this function is unit-agnostic,
 * it just applies UK tax bands to a single number.
 */
export function calcTax(gross: number): TaxResult {
  if (gross <= 0) return { tax: 0, ni: 0, takeHome: Math.max(0, gross) };

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

  let ni = 0;
  const niBasic = Math.max(0, Math.min(gross, UK_TAX.niUpperLimit) - UK_TAX.niPrimaryThreshold);
  ni += niBasic * UK_TAX.niMainRate;

  const niUpper = Math.max(0, gross - UK_TAX.niUpperLimit);
  ni += niUpper * UK_TAX.niUpperRate;

  return { tax, ni, takeHome: gross - tax - ni };
}

/** Marginal tax+NI cost of an additional `extra` of income stacked on top of `baseGross`. */
export function marginalTaxOnExtra(baseGross: number, extra: number): number {
  if (extra <= 0) return 0;
  const a = calcTax(baseGross);
  const b = calcTax(baseGross + extra);
  return b.tax + b.ni - (a.tax + a.ni);
}
