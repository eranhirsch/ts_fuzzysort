/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { asCharactersArray } from "../test/asCharactersArray";
import { findWordPrefixes } from "./findWordPrefixes";
import { nextWordBreakIndices } from "./wordBreaks";

// Ported from farzher/fuzzysort
describe("legacy", () => {
  test(
    "multiple backoff is fast",
    () => {
      expect(
        simplifiedFindWordPrefixes(
          "aaaaaaaaaaab",
          "a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a xb",
        ),
      ).toBeUndefined();
    },
    { timeout: 16 },
  );
});

test("first match is at last word and no prefix matches", () => {
  expect(
    simplifiedFindWordPrefixes("zom", "http://www.jacklmoore.com/zoom"),
  ).toEqual(undefined);
});

function simplifiedFindWordPrefixes(
  query: string,
  searchable: string,
): readonly number[] | undefined {
  const queryCodePoints = asCharactersArray(query);
  const searchableCodePoints = asCharactersArray(searchable);

  return findWordPrefixes(
    queryCodePoints,
    searchableCodePoints,
    // These are computed in the main function and passed in for perf, but for
    // testing we need to compute them on the fly.
    [...nextWordBreakIndices(searchable)],
    searchableCodePoints.indexOf(queryCodePoints[0]!),
  );
}
