/**
 * Similar to `String.prototype.indexOf`, but performs the search in sequence
 * for each code point in the needles. This means that returned indices are in
 * order.
 *
 * @param needles The sequence to being searched for.
 * @param haystack The sequence to search in.
 * @returns A sequence of indices that represent a projection of needles on
 * haystack; or `undefined` if no such sequence exists.
 */
export function indicesOf<T>(
  needles: readonly T[],
  haystack: readonly T[]
): readonly number[] | undefined {
  const output: number[] = [];

  for (const [searchableIndex, searchableCodePoint] of haystack.entries()) {
    if (needles[output.length] !== searchableCodePoint) {
      continue;
    }

    output.push(searchableIndex);
    if (output.length === needles.length) {
      // We've found a match for all code points in the query
      return output;
    }
  }

  // We haven't found a match for all code points in the query in the same
  // order, so this searchable doesn't contain a match (even fuzzy!)
  return undefined;
}
