import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const template = await readFile(
  new URL(
    "../../readthedocsext/theme/templates/core/email/base.html",
    import.meta.url,
  ),
  "utf8",
);

test("the compiled template retains the existing Django blocks", () => {
  for (const name of [
    "extra-styles",
    "top-right",
    "header",
    "salutation",
    "content",
    "signature",
    "footer",
  ]) {
    assert.ok(template.includes(`{% block ${name} %}`), name);
  }
});

test("the compiled template retains Django translations", () => {
  assert.ok(template.includes('{% trans "Hello!" %}'));
  assert.ok(template.includes('{% trans "Keep documenting," %}'));
  assert.ok(template.includes('{% trans "The Read the Docs team" %}'));
});

test("the header uses the hosted logo with alternative text", () => {
  assert.ok(
    template.includes(
      "https://assets.readthedocs.org/static/images/header-logo.png",
    ),
  );
  assert.ok(template.includes('alt="Read the Docs"'));
  assert.ok(template.includes('width="250"'));
  assert.ok(template.includes("{% block header %}{% endblock %}"));
  assert.ok(
    template.includes(
      '<a href="https://about.readthedocs.com">https://about.readthedocs.com</a>',
    ),
  );
});

test("the button retains the action URL and label as Django variables", async () => {
  const button = await readFile(
    new URL(
      "../../readthedocsext/theme/templates/core/email/button.html",
      import.meta.url,
    ),
    "utf8",
  );
  assert.ok(button.includes('href="{{ action_url }}"'));
  assert.ok(button.includes("{{ action_label }}"));
  assert.ok(button.includes('bgcolor="#00778e"'));
  assert.match(button, /align="center" style="font-size:0px;padding:0 0 16px/);
});
