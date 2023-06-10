// TODO [2024-01-01]: These helpers provide trivial extractors that might incur
// performance costs because of the extra function call. We need to benchmark
// this and see if it's worth optimizing for these cases.

import { find } from "./find";

export const findInString = (
  query: Parameters<typeof find>[0],
  entities: Iterable<string>
) => find(query, entities, (text) => text);

export const findInProperty = <
  K extends PropertyKey,
  T extends Record<K, string>
>(
  query: Parameters<typeof find>[0],
  entities: Iterable<T>,
  property: K
) => find(query, entities, ({ [property]: text }) => text);
