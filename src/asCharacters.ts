export function breakWords(
  characters: readonly string[]
): readonly (readonly string[])[] | undefined {
  let words: (readonly string[])[] | undefined;

  let lastSpace = -1;
  for (const [index, character] of characters.entries()) {
    if (character === " ") {
      // We skip consecutive spaces
      if (lastSpace < index - 1) {
        words ??= [];
        words.push(characters.slice(lastSpace + 1, index));
      }
      lastSpace = index;
    }
  }

  if (words === undefined) {
    return;
  }

  // add the last word
  words.push(characters.slice(lastSpace + 1));
  return words;
}
