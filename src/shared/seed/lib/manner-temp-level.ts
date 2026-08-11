/**
 * @file lib:manner-temp-level
 **/

export type MannerTempLevel = "l1" | "l2" | "l3" | "l4" | "l5" | "l6" | "l7" | "l8" | "l9" | "l10";

const MANNER_TEMP_BOUNDARIES = [
  Number.NEGATIVE_INFINITY,
  30,
  36,
  36.5,
  37,
  40,
  45,
  55,
  65,
  80,
  Number.POSITIVE_INFINITY,
] as const;
const MANNER_TEMP_LEVELS: MannerTempLevel[] = [
  "l1",
  "l2",
  "l3",
  "l4",
  "l5",
  "l6",
  "l7",
  "l8",
  "l9",
  "l10",
];

export function mannerTempToLevel(temperature: number): MannerTempLevel | undefined {
  for (let i = 0; i < MANNER_TEMP_BOUNDARIES.length - 1; i++) {
    const lower = MANNER_TEMP_BOUNDARIES[i];
    const upper = MANNER_TEMP_BOUNDARIES[i + 1];

    // The loop bounds guarantee both entries, but noUncheckedIndexedAccess cannot infer it.
    if (lower === undefined || upper === undefined) continue;

    if (temperature >= lower && temperature < upper) {
      return MANNER_TEMP_LEVELS[i];
    }
  }

  // Should never happen; boundaries are exhaustive
  throw new Error(`Invalid manner temperature: ${temperature}`);
}

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
