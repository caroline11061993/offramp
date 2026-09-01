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
  lisa0: 0,
  lisaContribM: 0,
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
  dbPensionOn: false,
  dbPensionAnnual0: 0,
  dbPensionNormalAge: 65,
  dbPensionReductionRate: 0.05,
  coupleMode: false,
  partnerSalary0: 0,
  partnerPension0: 0,
  partnerPensionContribM: 0,
  partnerPensionAccess: 57,
  partnerSalSacrifice: false,
  partnerDbPensionOn: false,
  partnerDbPensionAnnual0: 0,
  partnerDbPensionNormalAge: 65,
  partnerDbPensionReductionRate: 0.05,
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
const CODEC_VERSION = 4;

const fireAgeTupleSchema = z.tuple([
  num, // currentAge
  num, // lifeExpectancy
  num, // inflation
  num, // salary0
  num, // cash0
  num, // cashReturn
  num, // isa0
  num, // gia0
  num, // lisa0
  num, // lisaContribM
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
  bool, // dbPensionOn
  num, // dbPensionAnnual0
  num, // dbPensionNormalAge
  num, // dbPensionReductionRate
  bool, // coupleMode
  num, // partnerSalary0
  num, // partnerPension0
  num, // partnerPensionContribM
  num, // partnerPensionAccess
  bool, // partnerSalSacrifice
  bool, // partnerDbPensionOn
  num, // partnerDbPensionAnnual0
  num, // partnerDbPensionNormalAge
  num, // partnerDbPensionReductionRate
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
    state.lisa0,
    state.lisaContribM,
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
    state.dbPensionOn,
    state.dbPensionAnnual0,
    state.dbPensionNormalAge,
    state.dbPensionReductionRate,
    state.coupleMode,
    state.partnerSalary0,
    state.partnerPension0,
    state.partnerPensionContribM,
    state.partnerPensionAccess,
    state.partnerSalSacrifice,
    state.partnerDbPensionOn,
    state.partnerDbPensionAnnual0,
    state.partnerDbPensionNormalAge,
    state.partnerDbPensionReductionRate,
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
    lisa0: t[8],
    lisaContribM: t[9],
    pension0: t[10],
    pensionContribM: t[11],
    pensionAccess: t[12],
    salSacrifice: t[13],
    spend0: t[14],
    careAge: t[15],
    careRate: t[16],
    hasProperty: t[17],
    propValue0: t[18],
    mortgageBal0: t[19],
    mortgageRate: t[20],
    mortgageTerm: t[21],
    propAppreciation: t[22],
    spOn: t[23],
    spAge: t[24],
    spAmount0: t[25],
    dbPensionOn: t[26],
    dbPensionAnnual0: t[27],
    dbPensionNormalAge: t[28],
    dbPensionReductionRate: t[29],
    coupleMode: t[30],
    partnerSalary0: t[31],
    partnerPension0: t[32],
    partnerPensionContribM: t[33],
    partnerPensionAccess: t[34],
    partnerSalSacrifice: t[35],
    partnerDbPensionOn: t[36],
    partnerDbPensionAnnual0: t[37],
    partnerDbPensionNormalAge: t[38],
    partnerDbPensionReductionRate: t[39],
    eqOn: t[40],
    eqShares: t[41],
    eqPrice: t[42],
    eqFutureOn: t[43],
    eqFutureAnnual0: t[44],
    eqFutureYears: t[45],
    eqGrowth: t[46],
    eqMode: t[47],
    eqGradualPct: t[48],
    growth: t[49],
    pensionGrowth: t[50],
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
