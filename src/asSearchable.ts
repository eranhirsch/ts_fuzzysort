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

interface Searchable {
  readonly codePoints: readonly number[];
  readonly presentCharacters: RoaringBitmap32;
  readonly hasSpaces: boolean;
  readonly lowerCase: string;
}

export function asSearchable(raw: string): Searchable {
  const lowerCase = raw.toLowerCase();

  const codePoints: number[] = [];
  const presentCharacters = new RoaringBitmap32();

  let hasSpaces = false;

  for (const char of lowerCase) {
    const charCode = char.codePointAt(0);
    invariant(
      charCode !== undefined,
      `Couldn't get code point from '${char}' of raw ${raw}}`
    );

    codePoints.push(charCode);

    if (charCode === CODE_POINT_REGULAR_SPACE) {
      // We treat spaces differently, we don't encode them in the bitmap
      hasSpaces = true;
      continue;
    }

    const encodedBit =
      // Bits 0..25 are for each character separately
      charCode >= CODE_POINT_LOWERCASE_A && charCode <= CODE_POINT_LOWERCASE_Z
        ? charCode - CODE_POINT_LOWERCASE_A
        : // All digits will share a single bit
        charCode >= CODE_POINT_0 && charCode <= CODE_POINT_9
        ? BIT_DIGIT
        : // The next bit is for any other ASCII character
        charCode <= CODE_POINT_ASCII_MAX
        ? BIT_ASCII_SYMBOL
        : // And the final bit is for any non-ASCII character
          BIT_OTHER;

    presentCharacters.add(encodedBit);
  }

  return {
    codePoints,
    presentCharacters,
    hasSpaces,
    lowerCase,
  };
}
