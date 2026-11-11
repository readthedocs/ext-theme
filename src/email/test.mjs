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
});
