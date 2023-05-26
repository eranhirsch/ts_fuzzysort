import invariant from "tiny-invariant";
import { RoaringBitmap32 } from "roaring";

const CODE_POINT_LOWERCASE_A = 97;
const CODE_POINT_LOWERCASE_Z = 122;
const CODE_POINT_0 = 48;
const CODE_POINT_9 = 57;
const CODE_POINT_REGULAR_SPACE = 32;
const CODE_POINT_ASCII_MAX = 127;

const BIT_DIGIT = 25;
const BIT_ASCII_SYMBOL = 30;
const BIT_OTHER = 31;

interface Text {
  readonly codePoints: readonly number[];
  readonly presentCharacters: RoaringBitmap32;
  readonly lowerCase: string;
}

interface Query extends Text {
  readonly words: readonly Omit<Text, "presentCharacters">[];
}

interface Searchable extends Text {
  readonly raw: string;
}

export function createQuery(raw: string): Query {
  const trimmed = raw.trim();
  const lowerCase = trimmed.toLowerCase();

  const codePoints: number[] = [];

  const words: Omit<Text, "presentCharacters">[] = [];

  const presentCharacters = new RoaringBitmap32();

  let lastSpace = 0;
  for (const char of lowerCase) {
    const codePoint = char.codePointAt(0);
    // This should never fire, it's by definition of how iterators on strings
    // work
    invariant(codePoint !== undefined);

    if (codePoint === CODE_POINT_REGULAR_SPACE) {
      if (lastSpace < codePoints.length - 1) {
        words.push({
          codePoints: codePoints.slice(lastSpace),
          lowerCase: lowerCase.slice(lastSpace + 1, codePoints.length),
        });
      }
      lastSpace = codePoints.length;
    } else {
      presentCharacters.add(codePointEncoding(codePoint));
    }

    codePoints.push(codePoint);
  }

  return {
    lowerCase,
    codePoints,
    presentCharacters,
    words,
  };
}

export function createSearchable(raw: string): Searchable {
  const lowerCase = raw.toLowerCase();

  const codePoints: number[] = [];
  const presentCharacters = new RoaringBitmap32();

  for (const char of lowerCase) {
    const codePoint = char.codePointAt(0);
    invariant(codePoint !== undefined);

    if (codePoint !== CODE_POINT_REGULAR_SPACE) {
      presentCharacters.add(codePointEncoding(codePoint));
    }

    codePoints.push(codePoint);
  }

  return {
    raw,
    codePoints,
    presentCharacters,
    lowerCase,
  };
}

function codePointEncoding(codePoint: number): number {
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
