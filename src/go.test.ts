import { UE4_FILES, URLS_AND_TITLES } from "../test/data";
import { goStrings } from "./go";

describe("Ported from farzher/fuzzysort", () => {
  test("zom in URLS_AND_TITLES", () => {
    const result = goStrings("zom", URLS_AND_TITLES);
    expect(result).toMatchInlineSnapshot(`
      [
        "jQuery Zoom",
        "http://zaach.github.com/jison/demos/",
        "adazzle/react-data-grid: Excel-like grid component built with React, with editors, keyboard navigation, copy & paste, and the like http://adazzle.github.io/react-data-grid/",
        "moo.fx - size does matter",
        "http://foundation.zurb.com/docs/index.php",
        "http://www.smashingmagazine.com/2014/06/18/faster-ui-animations-with-velocity-js/?utm_source=html5weekly&utm_medium=email",
        "bvaughn/react-virtualized: React components for efficiently rendering large lists and tabular data",
        "epoberezkin/ajv: The fastest JSON-Schema Validator. Supports draft-04/06",
        "http://www.jacklmoore.com/zoom",
        "https://github.com/mortzdk/localStorage/?utm_source=javascriptweekly&utm_medium=email",
        "mozilla/webextension-polyfill: A lightweight polyfill library for Promise-based WebExtension APIs in Chrome",
        "GitHub - nolanlawson/optimize-js: Optimize a JavaScript file for faster initial load by wrapping eagerly-invoked functions",
        "https://github.com/adazzle/react-data-grid/blob/master/packages/react-data-grid/src/Cell.js",
        "aBcDeFgHiJkLmNoPqRsTuVwXyZAbCdEfGhIjKlMnOpQrStUvWxYzaBcDeFgHiJkLmNoPqRsTuVwXyZAbCdEfGhIjKlMnOpQrStUvWxYzaBcDeFgHiJkLmNoPqRsTuVwXyZAbCdEfGhIjKlMnOpQrStUvWxYzaBcDeFgHiJkLmNoPqRsTuVwXyZAbCdEfGhIjKlMnOpQrStUvWxYzaBcDeFgHiJkLmNoPqRsTuVwXyZAbCdEfGhIjKlMnOpQrStUvWxYz",
        "http://phonegap.com/?__vid__=Y29sbGVjdGlvblR5cGU9YWxpYXMBY29sbGVjdGlvbklEPXNjaHZlbmsBc291cmNlPXkuZGVsaWNpb3VzAWNsYXNzPWJvb2ttYXJrAXR5cGU9Ym9va21hcmsBc3VpZD1kNzE2ZGNmNWNmMTBlY2VjNjc5OGQxN2IxOTIzYTU4MA--",
        "http://www.omnipotent.net/jquery.sparkline/?__vid__=Y29sbGVjdGlvblR5cGU9YWxpYXMBY29sbGVjdGlvbklEPWNhbnRvbmliAXNvdXJjZT15LmRlbGljaW91cwFjbGFzcz1ib29rbWFyawF0eXBlPWJvb2ttYXJrAXN1aWQ9ZTZkODhhYzc3NDg5ZDA3YTY5Y2QxOWFkMmZiZmNhMWY-",
      ]
    `);
  });

  test("cman in UE4_FILES", () => {
    const result = goStrings("cman", UE4_FILES).slice(0, 2);
    expect(result).toMatchInlineSnapshot(`
      [
        "CrowdManager.h",
        "CheatManager.h",
      ]
    `);
  });
});
