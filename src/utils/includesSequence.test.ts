import { asCharactersArray } from "../../test/asCharactersArray";
import { includesSequence } from "./includesSequence";

describe("sanity", () => {
  test("happy", () => {
    expect(stringsIncludeSequence("hello world", "o wo")).toBe(true);
  });

  test("sad", () => {
    expect(stringsIncludeSequence("hello world", "goodbye")).toBe(false);
  });

  test("with start index", () => {
    expect(stringsIncludeSequence("abcdef", "abc")).toBe(true);
    expect(stringsIncludeSequence("abcdef", "abc", 1)).toBe(false);
  });

  // We do some optimizations to not over check, but we need to make sure we did
  // the index arithmetics correctly
  test("sequence is the last thing in the data", () => {
    expect(stringsIncludeSequence("abcdef", "def")).toBe(true);
  });
});

const stringsIncludeSequence = (
  data: string,
  sequence: string,
  startIndex = 0,
): boolean =>
  includesSequence(
    asCharactersArray(data),
    asCharactersArray(sequence),
    startIndex,
  );
