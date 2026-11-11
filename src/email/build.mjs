import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mjml2html from "mjml";

for (const name of ["base", "button"]) {
  const source = fileURLToPath(new URL(`./${name}.mjml`, import.meta.url));
  const target = fileURLToPath(
    new URL(
      `../../readthedocsext/theme/templates/core/email/${name}.html`,
      import.meta.url,
    ),
  );
  const mjml = await readFile(source, "utf8");
  let { html } = await mjml2html(mjml, { validationLevel: "strict" });
  if (typeof html !== "string") {
    throw new Error(`MJML did not produce HTML for ${name}.`);
  }
  if (name === "button") {
    const start = "<!-- BUTTON_START -->";
    const end = "<!-- BUTTON_END -->";
    if (!html.includes(start) || !html.includes(end)) {
      throw new Error("MJML button markers are missing.");
    }
    html = html.slice(html.indexOf(start) + start.length, html.indexOf(end));
  }
  const output =
    (name === "base" ? "{% load i18n %}\n" : "") +
    `<!-- Generated from src/email/${name}.mjml; do not edit directly. -->\n` +
    html.replace(/[ \t]+$/gm, "").trim() +
    "\n";

  if (process.argv.includes("--check")) {
    const existing = await readFile(target, "utf8");
    if (existing !== output) {
      console.error(`${name}.html is out of date. Run npm run email:build.`);
      process.exitCode = 1;
    }
  } else {
    await writeFile(target, output);
  }
}
