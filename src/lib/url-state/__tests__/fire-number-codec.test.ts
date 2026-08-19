import { describe, expect, it } from "vitest";
import {
  encodeFireNumberState,
  decodeFireNumberState,
  FIRE_NUMBER_DEFAULTS,
} from "../fire-number-codec";
import type { FireNumberInputs } from "@/lib/fire-engine/fire-number";

describe("fire-number-codec round-trip", () => {
  it("round-trips the default state exactly", () => {
    const encoded = encodeFireNumberState(FIRE_NUMBER_DEFAULTS);
    const decoded = decodeFireNumberState(encoded);
    expect(decoded).toEqual(FIRE_NUMBER_DEFAULTS);
  });

  it("round-trips a hand-modified state with debt and property on", () => {
    const state: FireNumberInputs = {
      ...FIRE_NUMBER_DEFAULTS,
      hasDebt: true,
      debtToday: 180000,
      debtMode: "gradual",
      hasProperty: true,
      property: 400000,
    };
    const encoded = encodeFireNumberState(state);
    const decoded = decodeFireNumberState(encoded);
    expect(decoded).toEqual(state);
  });

  it.each([null, undefined, "", "!!!invalid", "e30"])(
    "falls back to null (never throws) for invalid input %p",
    (input) => {
      expect(() => decodeFireNumberState(input)).not.toThrow();
      expect(decodeFireNumberState(input)).toBeNull();
    },
  );
});
