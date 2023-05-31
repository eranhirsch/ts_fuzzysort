import {
  CODE_POINT_0,
  CODE_POINT_9,
  CODE_POINT_LOWERCASE_A,
  CODE_POINT_LOWERCASE_Z,
  CODE_POINT_REGULAR_SPACE,
  createQuery,
} from "./text";

describe("const correctness", () => {
  test.each([
    [CODE_POINT_LOWERCASE_A, "a"],
    [CODE_POINT_LOWERCASE_Z, "z"],
    [CODE_POINT_0, "0"],
    [CODE_POINT_9, "9"],
    [CODE_POINT_REGULAR_SPACE, " "],
  ])('Code Point %i === "%s"', (codePoint, char) => {
    expect(char.codePointAt(0)).toBe(codePoint);
  });
});

describe("Query", () => {
  test("empty", () => {
    expect(createQuery("")).toMatchInlineSnapshot(`
      {
        "codePoints": [],
        "lowerCase": "",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [],
      }
    `);
  });

  test("single char", () => {
    expect(createQuery("a")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
        ],
        "lowerCase": "a",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [],
      }
    `);
  });

  test("single digit", () => {
    expect(createQuery("1")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          49,
        ],
        "lowerCase": "1",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            67108864,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [],
      }
    `);
  });

  test("single ascii symbol", () => {
    expect(createQuery("#")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          35,
        ],
        "lowerCase": "#",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            134217728,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [],
      }
    `);
  });

  test("non-ascii character", () => {
    expect(createQuery("💩")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          128169,
        ],
        "lowerCase": "💩",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            268435456,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [],
      }
    `);
  });

  test("all characters are different", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    expect(createQuery(alphabet).presentCharacters.size()).toBe(
      alphabet.length
    );
  });

  test("all digits are the same", () => {
    expect(createQuery("0123456789").presentCharacters.size()).toBe(1);
  });

  test("all ascii characters are the same", () => {
    expect(createQuery("$#@^%&*_+=-").presentCharacters.size()).toBe(1);
  });

  test("all emojis are the same", () => {
    expect(createQuery("💩🦄").presentCharacters.size()).toBe(1);
  });

  test("characters and digits are disjoint", () => {
    const alphabetAndDigit = "abcdefghijklmnopqrstuvwxyz0";
    expect(createQuery(alphabetAndDigit).presentCharacters.size()).toBe(
      alphabetAndDigit.length
    );
  });

  test("characters and ascii symbols are disjoint", () => {
    const alphabetAndDigit = "abcdefghijklmnopqrstuvwxyz#";
    expect(createQuery(alphabetAndDigit).presentCharacters.size()).toBe(
      alphabetAndDigit.length
    );
  });

  test("characters and emojis are disjoint", () => {
    expect(
      createQuery("abcdefghijklmnopqrstuvwxyz💩").presentCharacters.size()
    ).toBe(27);
  });

  test("digits and ascii chars are disjoint", () => {
    const alphabetAndDigit = "0#";
    expect(createQuery(alphabetAndDigit).presentCharacters.size()).toBe(
      alphabetAndDigit.length
    );
  });

  test("digits and emojis are disjoint", () => {
    expect(createQuery("0💩").presentCharacters.size()).toBe(2);
  });

  test("ascii symbols and emojis are disjoint", () => {
    expect(createQuery("#💩").presentCharacters.size()).toBe(2);
  });
});
