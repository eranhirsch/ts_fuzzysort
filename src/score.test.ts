/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { asCharactersArray } from "../test/asCharactersArray";
import { findWordPrefixes } from "./findWordPrefixes";
import { fuzzyMatch } from "./fuzzyMatch";
import { matchScore } from "./score";
import { indicesOf } from "./utils/indicesOf";
import { type NonEmptyArray } from "./utils/isNonEmpty";
import { nextWordBreakIndices } from "./wordBreaks";

describe("legacy", () => {
  test("exact match", () => {
    const input = "this is exactly the same search and target";
    expect(simpleMatchScore(input, input)).toBe(0);
  });

  test("scoring", () => {
    const query = "note";

    const score1 = simpleMatchScore(query, "node/NoTe");
    const score2 = simpleMatchScore(query, "not one that evening");

    expect(score1).greaterThan(score2);
  });

  test("substring not at start of word", () => {
    const query = "er.life360";

    const score1 = simpleMatchScore(query, "device-tracker.life360_iphone_6");
    const score2 = simpleMatchScore(query, "sendor.battery_life360_iphone_6");

    expect(score1).greaterThan(score2);
  });

  test("Partial queries yield lower scores", () => {
    const input = "The Amazing Spider-Man";

    const theAmazingSpiderScore = simpleMatchScore("The Amazing Spider", input);
    expect(theAmazingSpiderScore).toBeLessThan(0 /* score for exact match */);

    const theAmazingScore = simpleMatchScore("The Amazing", input);
    expect(theAmazingSpiderScore).toBeGreaterThan(theAmazingScore);

    const theScore = simpleMatchScore("The", input);
    expect(theAmazingScore).toBeGreaterThan(theScore);
  });
});

const simpleMatchScore = (query: string, target: string) =>
  matchScore(
    ...validatedParametersForMatchScore(asCharactersArray(query), target),
  );

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
  query: NonEmptyArray<string>,
  text: string,
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
function fakeFuzzyMatchResults(query: NonEmptyArray<string>, textRaw: string) {
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
    matchSequence[0]!,
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
