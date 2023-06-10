/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { asCharactersArray } from "../test/asCharactersArray";
import { findWordPrefixes } from "./findWordPrefixes";
import { fuzzyMatch } from "./fuzzyMatch";
import { matchScore } from "./score";
import { indicesOf } from "./utils/indicesOf";
import { nextWordBreakIndices } from "./wordBreaks";

describe("legacy", () => {
  test.each([
    ["note", "node/NoTe", "not one that evening"],
    [
      "er.life360",
      "device-tracker.life360_iphone_6",
      "sendor.battery_life360_iphone_6",
    ],
  ])("for query '%s': '%s' > '%s'", (queryRaw, text1, text2) => {
    const query = asCharactersArray(queryRaw);

    const parametersA = validatedParametersForMatchScore(query, text1);
    const parametersB = validatedParametersForMatchScore(query, text2);

    const score1 = matchScore(...parametersA);
    const score2 = matchScore(...parametersB);

    expect(score1).greaterThan(score2);
  });
});

/**
 * It's really hard to test the score method because it relies on so many of the
 * computations performed in the fuzzyMatch implementation. The only way we can
 * isolate it is by running the same logic in the test (by re-implementing it)
 * and then asserting it matches saved snapshots with as many of the results as
 * possible. Then we also need to assert it matches the result of running the
 * actual fuzzyMatch logic so that we can assert that the 2 implementations
 * haven't diverged.
 */
function validatedParametersForMatchScore(
  query: readonly string[],
  text: string
) {
  const parameters = fakeFuzzyMatchResults(query, text);
  expect(parameters).toMatchSnapshot();
  const { indices } = fuzzyMatch(query, text) ?? {};
  expect(indices).toMatchSnapshot();

  expect(parameters).toBeDefined();

  return parameters!;
}

/**
 * This function is an almost exact clone of `fuzzyMatch` until the point it
 * calls `matchScore`, at that point it returns the parameters it would have
 * sent to matchScore so that we can call the function ourselves as part of our
 * tests.
 */
function fakeFuzzyMatchResults(query: readonly string[], textRaw: string) {
  const text = [...textRaw.toLowerCase()];
  const matchSequence = indicesOf(query, text);
  if (matchSequence === undefined) {
    return;
  }

  const nextWordBreak = nextWordBreakIndices(textRaw);

  const wordPrefixesMatchSequence = findWordPrefixes(
    query,
    text,
    nextWordBreak,
    matchSequence[0]!
  );

  const indices = wordPrefixesMatchSequence ?? matchSequence;

  return [
    query,
    text,
    indices,
    wordPrefixesMatchSequence !== undefined,
    nextWordBreak,
  ] as const;
}
