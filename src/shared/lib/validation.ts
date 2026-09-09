/** A permissive typo check shared by forms, not a full RFC 5322 validator. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
