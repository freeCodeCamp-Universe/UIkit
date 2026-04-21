import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { Tooltip } from "./Tooltip.tsx";

test("Tooltip wraps children in .tip with role=tooltip bubble", () => {
  const html = renderToStaticMarkup(
    createElement(Tooltip, { content: "hint" }, "anchor"),
  );
  assert.match(html, /class="tip"/);
  assert.match(html, /role="tooltip"/);
  assert.match(html, /class="tip__bubble">hint</);
});
