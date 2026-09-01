/** UK earliest private-pension-drawdown age used as the default across both calculators. */
export const PENSION_ACCESS_AGE = 57;

/**
 * Dormant in the source UI (hidden fields, hardcoded) and kept dormant here per
 * product decision: users shouldn't have to make decisions on these two. The calc
 * engine still supports them (allocMode/bufferMonths are real FireAgeInputs fields)
 * so the logic isn't lost, just not exposed as form controls.
 */
export const DEFAULT_BUFFER_MONTHS = 12;
export const DEFAULT_ALLOC_MODE = "auto" as const;
export const DEFAULT_ISA_ALLOWANCE = 20000;

/**
 * Ceiling on findFireAge's implied withdrawal rate (first retired year's draw ÷
 * portfolio value before that draw). Bare survival to life expectancy isn't enough
 * on its own — a deterministic single-path simulation can still return an age with
 * a thin margin (found ~6.2%-9% in testing, well past the commonly-cited 4% benchmark
 * this site otherwise treats as the safety line). findFireAge requires both survival
 * AND this ceiling before accepting an age.
 */
export const MAX_SAFE_WITHDRAWAL_RATE = 0.04;

/** LISA rules: 25% government bonus on contributions up to the annual cap, no new
 *  contributions (or bonus) after the year you turn 50, and no penalty-free access
 *  before 60 (the house-deposit route isn't modelled — this calculator treats a LISA
 *  as a retirement wrapper). */
export const LISA_ANNUAL_CONTRIBUTION_CAP = 4000;
export const LISA_BONUS_RATE = 0.25;
export const LISA_CONTRIBUTION_END_AGE = 50;
export const LISA_ACCESS_AGE = 60;
