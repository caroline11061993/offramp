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
