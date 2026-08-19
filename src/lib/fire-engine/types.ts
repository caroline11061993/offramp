/**
 * Shared conventions across both engines:
 * - Every money field the user enters is "today's £" (real terms) unless documented otherwise.
 * - Every rate field is a decimal (0.02, not 2).
 * - Each rate field is documented as either REAL (inflation added back manually where the
 *   engine needs nominal compounding) or NOMINAL (used as-is, already includes inflation).
 *   This distinction is preserved per-field from the source and must not be unified.
 */

export type AllocMode = "auto" | "manual";
export type EquityCashOutMode = "gradual" | "atRetirement" | "hold";
export type DebtClearMode = "lump" | "gradual";
