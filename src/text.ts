import {
  CODE_POINT_REGULAR_SPACE,
  CODE_POINT_LOWERCASE_A,
  CODE_POINT_LOWERCASE_Z,
  CODE_POINT_0,
  CODE_POINT_9,
  CODE_POINT_ASCII_MAX,
} from "./CODE_POINTS";

const BIT_DIGIT = 26;
const BIT_ASCII_SYMBOL = 27;
const BIT_OTHER = 28;

interface Text {
  readonly codePoints: readonly number[];
  readonly lowerCase: string;
}

export interface Query extends Text {
  readonly words?: readonly Omit<Text, "presentCharacters">[];
}

export interface Searchable extends Text {
  readonly raw: string;
}

export function createQuery(raw: string): Query {
  const trimmed = raw.trim();
  const lowerCase = trimmed.toLowerCase();

  const codePoints: number[] = [];

  let words: Omit<Text, "presentCharacters">[] | undefined;

  let lastSpace = -1;
  for (const char of lowerCase) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- There's no easy around this
    const codePoint = char.codePointAt(0)!;

    if (codePoint === CODE_POINT_REGULAR_SPACE) {
      // We skip consecutive spaces
      if (lastSpace < codePoints.length - 1) {
        words ??= [];
        words.push(sliceLastWord(codePoints, lowerCase, lastSpace));
      }
      lastSpace = codePoints.length;
    }

    codePoints.push(codePoint);
  }

  if (words !== undefined) {
    // add the last word
    words.push(sliceLastWord(codePoints, lowerCase, lastSpace));
  }

  return {
    lowerCase,
    codePoints,
    ...(words !== undefined && { words }),
  };
}

export function createSearchable(raw: string): Searchable {
  const lowerCase = raw.toLowerCase();

  const codePoints: number[] = [];

  for (const char of lowerCase) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- There's no easy around this
    const codePoint = char.codePointAt(0)!;
    codePoints.push(codePoint);
  }

  return {
    raw,
    codePoints,
    lowerCase,
  };
}

export function codePointEncoding(codePoint: number): number {
  // Bits 0..25 are for each character separately
  return codePoint >= CODE_POINT_LOWERCASE_A &&
    codePoint <= CODE_POINT_LOWERCASE_Z
    ? codePoint - CODE_POINT_LOWERCASE_A
    : // All digits will share a single bit
    codePoint >= CODE_POINT_0 && codePoint <= CODE_POINT_9
    ? BIT_DIGIT
    : // The next bit is for any other ASCII character
    codePoint <= CODE_POINT_ASCII_MAX
    ? BIT_ASCII_SYMBOL
    : // And the final bit is for any non-ASCII character
      BIT_OTHER;
}

const sliceLastWord = (
  codePoints: number[],
  lowerCase: string,
  lastSpace: number
) =>
  ({
    codePoints: codePoints.slice(lastSpace + 1),
    lowerCase: lowerCase.slice(lastSpace + 1, codePoints.length),
  } as const);
