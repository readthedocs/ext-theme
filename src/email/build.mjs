import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mjml2html from "mjml";

const source = fileURLToPath(new URL("./base.mjml", import.meta.url));
const target = fileURLToPath(
  new URL(
    "../../readthedocsext/theme/templates/core/email/base.html",
    import.meta.url,
  ),
);
const mjml = await readFile(source, "utf8");
const { html } = await mjml2html(mjml, { validationLevel: "strict" });
if (typeof html !== "string") {
  throw new Error("MJML did not produce HTML.");
}
const output =
  "{% load i18n %}\n<!-- Generated from src/email/base.mjml; do not edit directly. -->\n" +
  html.replace(/[ \t]+$/gm, "").trimEnd() +
  "\n";

if (process.argv.includes("--check")) {
  const existing = await readFile(target, "utf8");
  if (existing !== output) {
    console.error("Email template is out of date. Run npm run email:build.");
    process.exitCode = 1;
  }
} else {
  await writeFile(target, output);
}
