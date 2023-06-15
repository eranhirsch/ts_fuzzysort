/* eslint-disable security/detect-object-injection */

export function includesSequence<T>(
  data: readonly T[],
  sequence: readonly T[],
  startIndex = 0
): boolean {
  let sequenceIndex = 0;

  for (
    let index = startIndex;
    index < data.length - (sequence.length - sequenceIndex - 1);
    index += 1
  ) {
    if (data[index] === sequence[sequenceIndex]) {
      if (sequenceIndex === sequence.length - 1) {
        return true;
      }

      sequenceIndex += 1;
    } else {
      sequenceIndex = 0;
    }
  }

  return false;
}
