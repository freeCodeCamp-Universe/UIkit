import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { Button } from "./Button.tsx";

test("Button renders .btn by default", () => {
  const html = renderToStaticMarkup(createElement(Button, null, "Go"));
  assert.match(html, /class="btn"/);
  assert.match(html, />Go</);
});

test("Button applies variant and size modifiers", () => {
  const html = renderToStaticMarkup(
    createElement(Button, { variant: "cta", size: "lg" }, "Start"),
  );
  assert.match(html, /class="btn btn--cta btn--lg"/);
});

test("Button shows spinner and aria-busy while loading", () => {
  const html = renderToStaticMarkup(
    createElement(Button, { isLoading: true }, "Saving"),
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /class="btn__spinner"/);
});

test("Button merges caller className", () => {
  const html = renderToStaticMarkup(
    createElement(Button, { className: "foo" }, "x"),
  );
  assert.match(html, /class="btn foo"/);
});
