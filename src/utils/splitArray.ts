/**
 * Splits the array similar to `String.prototype.split` but for arrays, but
 * treats consecutive separators as a single separator.
 *
 * @param data The array to split.
 * @param separator The separator to split on.
 * @returns
 */
export function splitArray<T>(
  data: readonly T[],
  separator: T
): readonly (readonly T[])[] {
  const words: (readonly T[])[] = [];

  let lastSpace = -1;
  for (const [index, character] of data.entries()) {
    if (character === separator) {
      // We skip consecutive spaces
      if (lastSpace < index - 1) {
        words.push(data.slice(lastSpace + 1, index));
      }
      lastSpace = index;
    }
  }

  if (lastSpace < data.length - 1) {
    // add the last word
    words.push(data.slice(lastSpace + 1));
  }
  return words;
}
