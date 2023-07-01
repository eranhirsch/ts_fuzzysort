/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { asCharactersArray } from "../test/asCharactersArray";
import { findWordPrefixes } from "./findWordPrefixes";
import { fuzzyMatch, type FuzzyMatchQuery } from "./fuzzyMatch";
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
});

const simpleMatchScore = (query: string, target: string) =>
  matchScore(...validatedParametersForMatchScore(query, target));

/**
 * It's really hard to test the score method because it relies on so many of the
 * computations performed in the fuzzyMatch implementation. The only way we can
 * isolate it is by running the same logic in the test (by re-implementing it)
 * and then asserting it matches saved snapshots with as many of the results as
 * possible. Then we also need to assert it matches the result of running the
 * actual fuzzyMatch logic so that we can assert that the 2 implementations
 * haven't diverged.
 */
function validatedParametersForMatchScore(lowercase: string, text: string) {
  const query = { lowercase, characters: asCharactersArray(lowercase) };
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
function fakeFuzzyMatchResults(query: FuzzyMatchQuery, textRaw: string) {
  const textLowercase = textRaw.toLowerCase();
  const text = [...textLowercase];

  const substringIndex = textLowercase.indexOf(query.lowercase);
  const substringSequence =
    substringIndex === -1
      ? undefined
      : // @ts-expect-error [ts2352]
        (Array.from({ length: query.lowercase.length }).map(
          (_, index) => index + substringIndex,
        ) as NonEmptyArray<number>);

  const matchSequence = substringSequence ?? indicesOf(query.characters, text);

  if (matchSequence === undefined) {
    return;
  }

  const nextWordBreak = nextWordBreakIndices(textRaw);

  const wordPrefixesMatchSequence = findWordPrefixes(
    query.characters,
    text,
    nextWordBreak,
    matchSequence[0]!,
  );

  const indices = wordPrefixesMatchSequence ?? matchSequence;

  return [
    query.characters,
    text,
    indices,
    wordPrefixesMatchSequence !== undefined,
    substringSequence !== undefined,
    nextWordBreak,
  ] as const;
}
