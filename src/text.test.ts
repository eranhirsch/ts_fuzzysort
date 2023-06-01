import { codePointEncoding, createQuery, createSearchable } from "./text";

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

  test("only characters", () => {
    expect(createQuery("abdef")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          98,
          100,
          101,
          102,
        ],
        "lowerCase": "abdef",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            59,
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

  test("only digits", () => {
    expect(createQuery("123456")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          49,
          50,
          51,
          52,
          53,
          54,
        ],
        "lowerCase": "123456",
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

  test("only ascii symbols", () => {
    expect(createQuery("#?@#@")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          35,
          63,
          64,
          35,
          64,
        ],
        "lowerCase": "#?@#@",
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

  test("only emojis", () => {
    expect(createQuery("💩💩💩💩")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          128169,
          128169,
          128169,
          128169,
        ],
        "lowerCase": "💩💩💩💩",
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

  test("mix of characters", () => {
    expect(createQuery("a1#💩")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          49,
          35,
          128169,
        ],
        "lowerCase": "a1#💩",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            469762049,
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

describe("Query space handling", () => {
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

  test("more than one space between words", () => {
    expect(createQuery("abc     def")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          98,
          99,
          32,
          32,
          32,
          32,
          32,
          100,
          101,
          102,
        ],
        "lowerCase": "abc     def",
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

  test("spaces at the beginning and end", () => {
    expect(createQuery("     abc def          ")).toMatchInlineSnapshot(`
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
});

describe("Searchable", () => {
  test("empty", () => {
    expect(createSearchable("")).toMatchInlineSnapshot(`
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
        "raw": "",
      }
    `);
  });

  test("characters", () => {
    expect(createSearchable("abcdef")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          98,
          99,
          100,
          101,
          102,
        ],
        "lowerCase": "abcdef",
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
        "raw": "abcdef",
      }
    `);
  });

  test("digits", () => {
    expect(createSearchable("123123")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          49,
          50,
          51,
          49,
          50,
          51,
        ],
        "lowerCase": "123123",
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
        "raw": "123123",
      }
    `);
  });

  test("ascii symbols", () => {
    expect(createSearchable("^#^#$**")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          94,
          35,
          94,
          35,
          36,
          42,
          42,
        ],
        "lowerCase": "^#^#$**",
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
        "raw": "^#^#$**",
      }
    `);
  });

  test("emojis", () => {
    expect(createSearchable("💩💩💩💩")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          128169,
          128169,
          128169,
          128169,
        ],
        "lowerCase": "💩💩💩💩",
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
        "raw": "💩💩💩💩",
      }
    `);
  });

  test("everything", () => {
    expect(createSearchable("asda123123*#$&#💩")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          97,
          115,
          100,
          97,
          49,
          50,
          51,
          49,
          50,
          51,
          42,
          35,
          36,
          38,
          35,
          128169,
        ],
        "lowerCase": "asda123123*#$&#💩",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            470024201,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "raw": "asda123123*#$&#💩",
      }
    `);
  });

  test("spaces", () => {
    expect(createSearchable("    ")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          32,
          32,
          32,
          32,
        ],
        "lowerCase": "    ",
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
        "raw": "    ",
      }
    `);
  });

  test("multiple words", () => {
    expect(createSearchable("hello world this works")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          104,
          101,
          108,
          108,
          111,
          32,
          119,
          111,
          114,
          108,
          100,
          32,
          116,
          104,
          105,
          115,
          32,
          119,
          111,
          114,
          107,
          115,
        ],
        "lowerCase": "hello world this works",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            5131672,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "raw": "hello world this works",
      }
    `);
  });

  test("spaces before and after", () => {
    expect(createSearchable("         hello world      "))
      .toMatchInlineSnapshot(`
        {
          "codePoints": [
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            104,
            101,
            108,
            108,
            111,
            32,
            119,
            111,
            114,
            108,
            100,
            32,
            32,
            32,
            32,
            32,
            32,
          ],
          "lowerCase": "         hello world      ",
          "presentCharacters": TypedFastBitSet {
            "words": Uint32Array [
              4343960,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
            ],
          },
          "raw": "         hello world      ",
        }
      `);
  });

  test("spaces between", () => {
    expect(createSearchable("hello        world")).toMatchInlineSnapshot(`
      {
        "codePoints": [
          104,
          101,
          108,
          108,
          111,
          32,
          32,
          32,
          32,
          32,
          32,
          32,
          32,
          119,
          111,
          114,
          108,
          100,
        ],
        "lowerCase": "hello        world",
        "presentCharacters": TypedFastBitSet {
          "words": Uint32Array [
            4343960,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
        "raw": "hello        world",
      }
    `);
  });

  test("case insensitivity (except raw)", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { raw: rawa, ...resta } = createSearchable("a");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { raw: rawA, ...restA } = createSearchable("A");
    expect(resta).toEqual(restA);
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
