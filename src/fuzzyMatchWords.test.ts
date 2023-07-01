import { asCharactersArray } from "../test/asCharactersArray";
import { fuzzyMatchWords } from "./fuzzyMatchWords";
import { queryWords } from "./queryWords";

describe("legacy", () => {
  test("Partial queries yield lower scores", () => {
    const input = "The Amazing Spider-Man";

    const theAmazingSpiderScore = simpleFuzzyMatchWords(
      "The Amazing Spider",
      input,
    );
    expect(theAmazingSpiderScore).toBeLessThan(0 /* score for exact match */);

    const theAmazingScore = simpleFuzzyMatchWords("The Amazing", input);
    expect(theAmazingSpiderScore).toBeGreaterThan(
      theAmazingScore ?? Number.POSITIVE_INFINITY,
    );

    const theScore = simpleFuzzyMatchWords("The", input);
    expect(theAmazingScore).toBeGreaterThan(
      theScore ?? Number.POSITIVE_INFINITY,
    );
  });

  test("order matters (word starts)", () => {
    const target1 = "CheatManager.h";
    const target2 = "ManageCheats.h";

    const query1 = "c man";
    expect(simpleFuzzyMatchWords(query1, target1)).toBeGreaterThan(
      simpleFuzzyMatchWords(query1, target2) ?? Number.POSITIVE_INFINITY,
    );

    const query2 = "man c";
    expect(simpleFuzzyMatchWords(query2, target1)).toBeLessThan(
      simpleFuzzyMatchWords(query2, target2) ?? Number.NEGATIVE_INFINITY,
    );
  });

  test("order matters (lowercase match)", () => {
    const target1 = "ThisManagesStuff.c";
    const target2 = "ThisCheatsStuff.man";

    const query1 = "man c";
    expect(simpleFuzzyMatchWords(query1, target1)).toBeGreaterThan(
      simpleFuzzyMatchWords(query1, target2) ?? Number.POSITIVE_INFINITY,
    );

    const query2 = "c man";
    expect(simpleFuzzyMatchWords(query2, target1)).toBeLessThan(
      simpleFuzzyMatchWords(query2, target2) ?? Number.NEGATIVE_INFINITY,
    );
  });
});

function simpleFuzzyMatchWords(
  query: string,
  target: string,
): number | undefined {
  const result = fuzzyMatchWords(
    queryWords(query),
    { characters: asCharactersArray(query), lowercase: query },
    target,
  );
  return result?.score;
}
