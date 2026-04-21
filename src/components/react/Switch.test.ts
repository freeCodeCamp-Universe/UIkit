import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { Switch } from "./Switch.tsx";

test("Switch renders .switch with track + thumb", () => {
  const html = renderToStaticMarkup(createElement(Switch, { label: "A" }));
  assert.match(html, /class="switch"/);
  assert.match(html, /class="switch__track"/);
  assert.match(html, /class="switch__thumb"/);
  assert.match(html, /class="switch__label"/);
});

test("Switch renders without label when omitted", () => {
  const html = renderToStaticMarkup(createElement(Switch));
  assert.ok(!html.includes("switch__label"));
});
