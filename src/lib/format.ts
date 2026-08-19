export function fmtGBP(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}£${Math.round(abs).toLocaleString("en-GB")}`;
}

export function fmtPct(n: number, decimals = 1): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Percentage-field rate <-> decimal-fraction conversions for number inputs, rounded
 * to kill floating-point drift (e.g. 0.065 * 100 === 6.500000000000001 in JS) so an
 * editable field never shows something like "7.00000001" after a round-trip.
 */
export function toPercentInput(decimal: number): number {
  return Math.round(decimal * 100 * 1e6) / 1e6;
}

export function fromPercentInput(percent: number): number {
  return Math.round((percent / 100) * 1e8) / 1e8;
}
