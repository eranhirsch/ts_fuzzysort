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
export function indicesOf<Needles extends readonly unknown[] | []>(
  needles: Needles,
  haystack: readonly Needles[number][]
): { readonly [P in keyof Needles]: number } | undefined {
  const output: number[] = [];

  for (const [searchableIndex, searchableCodePoint] of haystack.entries()) {
    if (needles[output.length] !== searchableCodePoint) {
      continue;
    }

    output.push(searchableIndex);
    if (output.length === needles.length) {
      // We've found a match for all code points in the query
      // @ts-expect-error [ts2322] - We build output incrementally so typescript can't ensure that it matches the expected output.
      return output;
    }
  }

  // We haven't found a match for all code points in the query in the same
  // order, so this searchable doesn't contain a match (even fuzzy!)
  return undefined;
}
