import { z } from "zod";
import type { FireNumberInputs } from "@/lib/fire-engine/fire-number";
import type { DebtClearMode } from "@/lib/fire-engine/types";
import { encodeBase64Url, decodeBase64Url } from "./base64url";

export const FIRE_NUMBER_DEFAULTS: FireNumberInputs = {
  currentAge: 32,
  retireAge: 50,
  lifeExpectancy: 90,
  spend: 30000,
  hasDebt: false,
  debtToday: 0,
  debtRate: 0.045,
  debtTerm: 20,
  debtMode: "lump",
  cash: 20000,
  isa: 40000,
  gia: 10000,
  pension: 30000,
  growth: 0.045,
  swr: 0.035,
  hasProperty: false,
  property: 0,
  propGrowth: 0.01,
};

const debtModeSchema: z.ZodType<DebtClearMode> = z.enum(["lump", "gradual"]);
const num = z.number().finite();
const bool = z.boolean();

const CODEC_VERSION = 1;

const fireNumberTupleSchema = z.tuple([
  num, // currentAge
  num, // retireAge
  num, // lifeExpectancy
  num, // spend
  bool, // hasDebt
  num, // debtToday
  num, // debtRate
  num, // debtTerm
  debtModeSchema, // debtMode
  num, // cash
  num, // isa
  num, // gia
  num, // pension
  num, // growth
  num, // swr
  bool, // hasProperty
  num, // property
  num, // propGrowth
]);

function stateToTuple(state: FireNumberInputs): z.infer<typeof fireNumberTupleSchema> {
  return [
    state.currentAge,
    state.retireAge,
    state.lifeExpectancy,
    state.spend,
    state.hasDebt,
    state.debtToday,
    state.debtRate,
    state.debtTerm,
    state.debtMode,
    state.cash,
    state.isa,
    state.gia,
    state.pension,
    state.growth,
    state.swr,
    state.hasProperty,
    state.property,
    state.propGrowth,
  ];
}

function tupleToState(t: z.infer<typeof fireNumberTupleSchema>): FireNumberInputs {
  return {
    currentAge: t[0],
    retireAge: t[1],
    lifeExpectancy: t[2],
    spend: t[3],
    hasDebt: t[4],
    debtToday: t[5],
    debtRate: t[6],
    debtTerm: t[7],
    debtMode: t[8],
    cash: t[9],
    isa: t[10],
    gia: t[11],
    pension: t[12],
    growth: t[13],
    swr: t[14],
    hasProperty: t[15],
    property: t[16],
    propGrowth: t[17],
  };
}

export function encodeFireNumberState(state: FireNumberInputs): string {
  const payload = [CODEC_VERSION, ...stateToTuple(state)];
  return encodeBase64Url(JSON.stringify(payload));
}

/** Never throws — returns null on any malformed/tampered/outdated param. */
export function decodeFireNumberState(
  param: string | null | undefined,
): FireNumberInputs | null {
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
  const result = fireNumberTupleSchema.safeParse(parsed.slice(1));
  if (!result.success) return null;
  return tupleToState(result.data);
}
