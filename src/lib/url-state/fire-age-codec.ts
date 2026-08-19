import { z } from "zod";
import type { FireAgeInputs } from "@/lib/fire-engine/fire-age";
import type { EquityCashOutMode } from "@/lib/fire-engine/types";
import {
  DEFAULT_ALLOC_MODE,
  DEFAULT_BUFFER_MONTHS,
  DEFAULT_ISA_ALLOWANCE,
} from "@/lib/fire-engine/constants";
import { encodeBase64Url, decodeBase64Url } from "./base64url";

/**
 * The subset of FireAgeInputs a user can actually adjust in the UI. Excludes the
 * dormant, hardcoded-only fields (bufferMonths, allocMode, isaAllowance,
 * isaContribM, giaContribM) — those never round-trip through the URL, they're
 * always re-applied as constants when building the full engine input (see
 * `toFireAgeInputs`).
 */
export type FireAgeFormState = Omit<
  FireAgeInputs,
  "bufferMonths" | "allocMode" | "isaAllowance" | "isaContribM" | "giaContribM"
>;

export const FIRE_AGE_DEFAULTS: FireAgeFormState = {
  currentAge: 32,
  lifeExpectancy: 80,
  inflation: 0.02,
  salary0: 70000,
  cash0: 15000,
  cashReturn: 0.005,
  isa0: 25000,
  gia0: 8000,
  pension0: 40000,
  pensionContribM: 400,
  pensionAccess: 57,
  salSacrifice: false,
  spend0: 30000,
  careAge: 70,
  careRate: 0.02,
  hasProperty: true,
  propValue0: 350000,
  mortgageBal0: 250000,
  mortgageRate: 0.045,
  mortgageTerm: 25,
  propAppreciation: 0.01,
  spOn: true,
  spAge: 67,
  spAmount0: 11500,
  eqOn: false,
  eqShares: 200,
  eqPrice: 50,
  eqFutureOn: false,
  eqFutureAnnual0: 8000,
  eqFutureYears: 4,
  eqGrowth: 0.06,
  eqMode: "atRetirement",
  eqGradualPct: 0.25,
  growth: 0.065,
  pensionGrowth: 0.065,
};

export function toFireAgeInputs(state: FireAgeFormState): FireAgeInputs {
  return {
    ...state,
    bufferMonths: DEFAULT_BUFFER_MONTHS,
    allocMode: DEFAULT_ALLOC_MODE,
    isaAllowance: DEFAULT_ISA_ALLOWANCE,
    isaContribM: 0,
    giaContribM: 0,
  };
}

const eqModeSchema: z.ZodType<EquityCashOutMode> = z.enum(["gradual", "atRetirement", "hold"]);
const num = z.number().finite();
const bool = z.boolean();

// Fixed-position tuple, one entry per FireAgeFormState field, in a stable declared
// order. A leading version tag lets a future field addition be detected safely —
// old shared links with an outdated shape fall back to defaults rather than crash.
const CODEC_VERSION = 1;

const fireAgeTupleSchema = z.tuple([
  num, // currentAge
  num, // lifeExpectancy
  num, // inflation
  num, // salary0
  num, // cash0
  num, // cashReturn
  num, // isa0
  num, // gia0
  num, // pension0
  num, // pensionContribM
  num, // pensionAccess
  bool, // salSacrifice
  num, // spend0
  num, // careAge
  num, // careRate
  bool, // hasProperty
  num, // propValue0
  num, // mortgageBal0
  num, // mortgageRate
  num, // mortgageTerm
  num, // propAppreciation
  bool, // spOn
  num, // spAge
  num, // spAmount0
  bool, // eqOn
  num, // eqShares
  num, // eqPrice
  bool, // eqFutureOn
  num, // eqFutureAnnual0
  num, // eqFutureYears
  num, // eqGrowth
  eqModeSchema, // eqMode
  num, // eqGradualPct
  num, // growth
  num, // pensionGrowth
]);

function stateToTuple(state: FireAgeFormState): z.infer<typeof fireAgeTupleSchema> {
  return [
    state.currentAge,
    state.lifeExpectancy,
    state.inflation,
    state.salary0,
    state.cash0,
    state.cashReturn,
    state.isa0,
    state.gia0,
    state.pension0,
    state.pensionContribM,
    state.pensionAccess,
    state.salSacrifice,
    state.spend0,
    state.careAge,
    state.careRate,
    state.hasProperty,
    state.propValue0,
    state.mortgageBal0,
    state.mortgageRate,
    state.mortgageTerm,
    state.propAppreciation,
    state.spOn,
    state.spAge,
    state.spAmount0,
    state.eqOn,
    state.eqShares,
    state.eqPrice,
    state.eqFutureOn,
    state.eqFutureAnnual0,
    state.eqFutureYears,
    state.eqGrowth,
    state.eqMode,
    state.eqGradualPct,
    state.growth,
    state.pensionGrowth,
  ];
}

function tupleToState(t: z.infer<typeof fireAgeTupleSchema>): FireAgeFormState {
  return {
    currentAge: t[0],
    lifeExpectancy: t[1],
    inflation: t[2],
    salary0: t[3],
    cash0: t[4],
    cashReturn: t[5],
    isa0: t[6],
    gia0: t[7],
    pension0: t[8],
    pensionContribM: t[9],
    pensionAccess: t[10],
    salSacrifice: t[11],
    spend0: t[12],
    careAge: t[13],
    careRate: t[14],
    hasProperty: t[15],
    propValue0: t[16],
    mortgageBal0: t[17],
    mortgageRate: t[18],
    mortgageTerm: t[19],
    propAppreciation: t[20],
    spOn: t[21],
    spAge: t[22],
    spAmount0: t[23],
    eqOn: t[24],
    eqShares: t[25],
    eqPrice: t[26],
    eqFutureOn: t[27],
    eqFutureAnnual0: t[28],
    eqFutureYears: t[29],
    eqGrowth: t[30],
    eqMode: t[31],
    eqGradualPct: t[32],
    growth: t[33],
    pensionGrowth: t[34],
  };
}

export function encodeFireAgeState(state: FireAgeFormState): string {
  const payload = [CODEC_VERSION, ...stateToTuple(state)];
  return encodeBase64Url(JSON.stringify(payload));
}

/** Never throws — returns null on any malformed/tampered/outdated param, so a
 *  hand-edited or stale shared URL just falls back to defaults instead of crashing. */
export function decodeFireAgeState(param: string | null | undefined): FireAgeFormState | null {
  if (!param) return null;
  const json = decodeBase64Url(param);
  if (json === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed[0] !== CODEC_VERSION) return null;
  const result = fireAgeTupleSchema.safeParse(parsed.slice(1));
  if (!result.success) return null;
  return tupleToState(result.data);
}
