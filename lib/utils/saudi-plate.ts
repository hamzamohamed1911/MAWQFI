/** Saudi-style plate: 1–4 digits then 1–3 letters (e.g. 1234ABC). */
const SAUDI_PLATE_PATTERN = /^(\d{1,4})([\p{L}]{1,3})$/u;

export function normalizePlateValue(plate: string): string {
  const trimmed = plate.trim();
  const match = trimmed.match(SAUDI_PLATE_PATTERN);
  if (!match) {
    return trimmed.toUpperCase();
  }
  const digits = match[1];
  const letters = match[2].toUpperCase();
  return `${digits}${letters}`;
}

export function isValidSaudiPlate(plate: string): boolean {
  const normalized = normalizePlateValue(plate);
  return SAUDI_PLATE_PATTERN.test(normalized);
}
