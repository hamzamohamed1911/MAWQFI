/** Saudi plate Latin letters and their Arabic counterparts. */
const LATIN_TO_ARABIC_PLATE_LETTER: Record<string, string> = {
  A: "أ",
  B: "ب",
  J: "ح",
  D: "د",
  R: "ر",
  S: "س",
  X: "ص",
  T: "ط",
  E: "ع",
  G: "ق",
  K: "ك",
  L: "ل",
  Z: "م",
  N: "ن",
  H: "ه",
  U: "و",
  V: "ى",
};

const WESTERN_TO_ARABIC_DIGIT: Record<string, string> = {
  "0": "٠",
  "1": "١",
  "2": "٢",
  "3": "٣",
  "4": "٤",
  "5": "٥",
  "6": "٦",
  "7": "٧",
  "8": "٨",
  "9": "٩",
};

/** Arabic-Indic digits in the same order as the entered Western digits. */
export function toArabicPlateDigits(digits: string): string {
  return [...digits].map((char) => WESTERN_TO_ARABIC_DIGIT[char] ?? char).join("");
}

/** Arabic plate letters in the same order as the entered Latin letters. */
export function toArabicPlateLetters(letters: string): string {
  return [...letters.toUpperCase()]
    .map((char) => LATIN_TO_ARABIC_PLATE_LETTER[char] ?? "")
    .filter(Boolean)
    .join(" ");
}

const ARABIC_TO_LATIN_PLATE_LETTER: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_ARABIC_PLATE_LETTER).map(([latin, arabic]) => [
    arabic,
    latin,
  ]),
);

const SAUDI_PLATE_LATIN = Object.keys(LATIN_TO_ARABIC_PLATE_LETTER).join("");

/** Saudi-style plate: 1–4 digits then 1–3 allowed letters (e.g. 1234ABJ). */
const SAUDI_PLATE_PATTERN = new RegExp(
  `^(\\d{1,4})([${SAUDI_PLATE_LATIN}]{1,3})$`,
);

/** Keeps only Saudi plate letters, mapping Arabic input to its Latin letter. */
export function sanitizePlateLetters(raw: string): string {
  let letters = "";

  for (const char of raw) {
    const upper = char.toUpperCase();
    const latin = LATIN_TO_ARABIC_PLATE_LETTER[upper]
      ? upper
      : ARABIC_TO_LATIN_PLATE_LETTER[char];

    if (!latin) {
      continue;
    }

    letters += latin;
    if (letters.length === 3) {
      break;
    }
  }

  return letters;
}

export function normalizePlateValue(plate: string): string {
  const compact = plate.trim().replace(/\s+/g, "");
  const match = compact.match(/^(\d{0,4})(.*)$/);
  const digits = match?.[1] ?? "";
  const letters = sanitizePlateLetters(match?.[2] ?? "");
  return `${digits}${letters}`;
}

export function isValidSaudiPlate(plate: string): boolean {
  const normalized = normalizePlateValue(plate);
  return SAUDI_PLATE_PATTERN.test(normalized);
}
