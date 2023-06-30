export function nextWordBreakIndices(input: string): readonly number[] {
  const characters = [...input];

  const output: number[] = Array.from({ length: characters.length });

  let previousWordBreakIndex = 0;
  for (const wordBreakIndex of findWordBreakIndices(characters)) {
    output.fill(wordBreakIndex, previousWordBreakIndex, wordBreakIndex);
    previousWordBreakIndex = wordBreakIndex;
  }
  output.fill(characters.length, previousWordBreakIndex);

  return output;
}

export function* findWordBreakIndices(
  characters: readonly string[],
): Generator<number, undefined> {
  let previousWasUpperCase = false;
  let previousAlphaNumeric = false;

  for (const [index, character] of characters.entries()) {
    // Would these be more efficient as a regex? Does JS offer any helpers?
    const isUpper = character >= "A" && character <= "Z";
    const isAlphaNumeric =
      isUpper ||
      (character >= "a" && character <= "z") ||
      (character >= "0" && character <= "9");

    if (
      index > 0 &&
      ((isUpper && !previousWasUpperCase) ||
        !previousAlphaNumeric ||
        !isAlphaNumeric)
    ) {
      yield index;
    }

    previousWasUpperCase = isUpper;
    previousAlphaNumeric = isAlphaNumeric;
  }

  return undefined;
}
