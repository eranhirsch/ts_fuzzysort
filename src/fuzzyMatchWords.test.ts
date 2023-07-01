import { asCharactersArray } from "../test/asCharactersArray";
import { fuzzyMatchWords } from "./fuzzyMatchWords";

describe("legacy", () => {
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
  const words = query.split(" ").map((word) => asCharactersArray(word));

  const result = fuzzyMatchWords(words, asCharactersArray(query), target);
  return result?.score;
}
