import { Registry } from "../application/registry";

/**
 * View for the site-wide footer.
 *
 * Exposes ``language_config``, the FUI dropdown configuration for the language
 * selector. Selecting a language submits the parent form, so there is no
 * separate Update button.
 */
export class FooterView {
  static view_name = "FooterView";

  constructor() {
    this.language_config = {
      direction: "upward",
      fullTextSearch: true,
      cache: false,
      onChange: (value, text, $elem) => {
        if (!value) {
          return;
        }
        $elem.closest("form").submit();
      },
    };
  }
}
Registry.add_view(FooterView);
