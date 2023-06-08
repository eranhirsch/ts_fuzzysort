/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { findWordPrefixes } from "./sequence";
import { nextWordBreakIndices } from "./wordBreaks";

describe("findStrictSequence", () => {
  test("bad case we found", () => {
    wrapper("zom", "http://www.jacklmoore.com/zoom");
  });
});

function wrapper(
  query: string,
  searchable: string
): readonly number[] | undefined {
  const queryCodePoints = asCodePointsArray(query);
  const searchableCodePoints = asCodePointsArray(searchable);

  return findWordPrefixes(
    queryCodePoints,
    searchableCodePoints,
    // These are computed in the main function and passed in for perf, but for
    // testing we need to compute them on the fly.
    [...nextWordBreakIndices(searchable)],
    searchableCodePoints.indexOf(queryCodePoints[0]!)
  );
}

const asCodePointsArray = (raw: string) =>
  [...raw.toLowerCase()].map((char) => char.codePointAt(0)!);
