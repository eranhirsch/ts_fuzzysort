import {
  CODE_POINT_0,
  CODE_POINT_9,
  CODE_POINT_LOWERCASE_A,
  CODE_POINT_LOWERCASE_Z,
  CODE_POINT_REGULAR_SPACE,
  codePointEncoding,
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
      }
    `);
  });

  test("case insensitivity", () => {
    expect(createQuery("a")).toEqual(createQuery("A"));
  });
});

describe("space handling", () => {
  test("just a space", () => {
    expect(createQuery(" ")).toMatchInlineSnapshot(`
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
      }
    `);
  });

  test("just a lot of spaces", () => {
    expect(createQuery("                      ")).toMatchInlineSnapshot(`
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
      }
    `);
  });

  test("2 words", () => {
    expect(createQuery("abc def")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          98,
          99,
          32,
          100,
          101,
          102,
        ],
        "lowerCase": "abc def",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            63,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [
          {
            "codePoints": [
              97,
              98,
              99,
            ],
            "lowerCase": "abc",
          },
          {
            "codePoints": [
              100,
              101,
              102,
            ],
            "lowerCase": "def",
          },
        ],
      }
    `);
  });

  test("3 words", () => {
    expect(createQuery("abc def ghi")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          98,
          99,
          32,
          100,
          101,
          102,
          32,
          103,
          104,
          105,
        ],
        "lowerCase": "abc def ghi",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            511,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "words": [
          {
            "codePoints": [
              97,
              98,
              99,
            ],
            "lowerCase": "abc",
          },
          {
            "codePoints": [
              100,
              101,
              102,
            ],
            "lowerCase": "def",
          },
          {
            "codePoints": [
              103,
              104,
              105,
            ],
            "lowerCase": "ghi",
          },
        ],
      }
    `);
  });
});

describe("codePointEncoding", () => {
  test("each character is a different code", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz")).toBe(26);
  });

  test("all digits have the same code", () => {
    expect(uniqueEncodedValuesCount("0123456789")).toBe(1);
  });

  test("all ascii symbols have the same code", () => {
    expect(uniqueEncodedValuesCount("`~!@#$%^&*()_+-=[]{}\\|;:'\",<.>/?")).toBe(
      1
    );
  });

  test("all emojis have the same code", () => {
    expect(uniqueEncodedValuesCount("💩🦄")).toBe(1);
  });

  test("characters and digits are disjoint", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz0")).toBe(27);
  });

  test("characters and ascii symbols are disjoint", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz?")).toBe(27);
  });

  test("characters and emojis are disjoint", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz💩")).toBe(27);
  });

  test("digits and ascii symbols are disjoint", () => {
    expect(uniqueEncodedValuesCount("0?")).toBe(2);
  });

  test("digits and emojis are disjoint", () => {
    expect(uniqueEncodedValuesCount("0💩")).toBe(2);
  });

  test("ascii symbols and emojis are disjoint", () => {
    expect(uniqueEncodedValuesCount("#💩")).toBe(2);
  });
});

function uniqueEncodedValuesCount(characters: string): number {
  const codes = new Set();
  for (const char of characters) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const codePoint = char.codePointAt(0)!;
    codes.add(codePointEncoding(codePoint));
  }
  return codes.size;
}
