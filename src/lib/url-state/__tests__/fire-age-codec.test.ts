import { describe, expect, it } from "vitest";
import {
  encodeFireAgeState,
  decodeFireAgeState,
  FIRE_AGE_DEFAULTS,
  type FireAgeFormState,
} from "../fire-age-codec";

describe("fire-age-codec round-trip", () => {
  it("round-trips the default state exactly", () => {
    const encoded = encodeFireAgeState(FIRE_AGE_DEFAULTS);
    const decoded = decodeFireAgeState(encoded);
    expect(decoded).toEqual(FIRE_AGE_DEFAULTS);
  });

  it("round-trips a hand-modified state, including the equity module and property toggle off", () => {
    const state: FireAgeFormState = {
      ...FIRE_AGE_DEFAULTS,
      currentAge: 41,
      hasProperty: false,
      propValue0: 0,
      mortgageBal0: 0,
      eqOn: true,
      eqMode: "gradual",
      eqGradualPct: 0.5,
    };
    const encoded = encodeFireAgeState(state);
    const decoded = decodeFireAgeState(encoded);
    expect(decoded).toEqual(state);
  });

  it("produces a URL-safe string with no padding characters", () => {
    const encoded = encodeFireAgeState(FIRE_AGE_DEFAULTS);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it.each([null, undefined, "", "not-base64!!", "e30", "%%%"])(
    "falls back to null (never throws) for invalid input %p",
    (input) => {
      expect(() => decodeFireAgeState(input)).not.toThrow();
      expect(decodeFireAgeState(input)).toBeNull();
    },
  );

  it("rejects a tampered payload with a mismatched version tag", () => {
    const encoded = encodeFireAgeState(FIRE_AGE_DEFAULTS);
    const decodedJson = JSON.parse(
      Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"),
    );
    decodedJson[0] = 999; // future/unknown version
    const tampered = Buffer.from(JSON.stringify(decodedJson))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(decodeFireAgeState(tampered)).toBeNull();
  });

  it("rejects a payload with the wrong arity (a field added/removed)", () => {
    const payload = [1, 32, 80]; // way too short
    const encoded = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(decodeFireAgeState(encoded)).toBeNull();
  });
});
