import {
  CODE_POINT_0,
  CODE_POINT_9,
  CODE_POINT_LOWERCASE_A,
  CODE_POINT_LOWERCASE_Z,
  CODE_POINT_REGULAR_SPACE,
} from "./CODE_POINTS";

describe("const correctness", () => {
  test.each([
    [CODE_POINT_0, "0"],
    [CODE_POINT_9, "9"],
    [CODE_POINT_LOWERCASE_A, "a"],
    [CODE_POINT_LOWERCASE_Z, "z"],
    [CODE_POINT_REGULAR_SPACE, " "],
  ])('Code Point %i === "%s"', (codePoint, char) => {
    expect(char.codePointAt(0)).toBe(codePoint);
  });
});
