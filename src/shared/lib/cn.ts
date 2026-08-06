import clsx, { type ClassValue } from "clsx";

/**
 * Joins class names conditionally.
 *
 * Deliberately not `tailwind-merge`: SEED replaces Tailwind's spacing, colour and
 * radius scales with its own, so tailwind-merge's built-in conflict table would
 * mis-resolve pairs like `p-x2 p-x4`. Order the classes yourself instead.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
