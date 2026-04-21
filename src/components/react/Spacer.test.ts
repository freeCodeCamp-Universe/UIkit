import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { Spacer } from "./Spacer.tsx";

test("Spacer step size maps to token scale", () => {
  const html = renderToStaticMarkup(createElement(Spacer, { size: 5 }));
  assert.match(html, /class="spacer"/);
  assert.match(html, /width:24px/);
});

test("Spacer vertical axis swaps width/height", () => {
  const html = renderToStaticMarkup(
    createElement(Spacer, { size: 3, axis: "vertical" }),
  );
  assert.match(html, /height:12px/);
});
