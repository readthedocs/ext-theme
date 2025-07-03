import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

/**
 * Organization authorization settings
 */
export class OrganizationSettingsAuthorizationView {
    static view_name = "OrganizationSettingsAuthorizationView";

    constructor() {
        this.provider_original = undefined;
        this.provider = ko.observable();

        this.show_warning = ko.observable(false);
        this.provider.subscribe(
            (value) => {
                if (this.provider_original === undefined) {
                    this.provider_original = value;
                }
            },
            this,
            "beforeChange",
        );
        this.provider.subscribe((value) => {
            if (
                this.provider_original !== undefined &&
                    value !== this.provider_original
            ) {
                this.show_warning(true);
            } else {
                this.show_warning(false);
            }
        });
        this.use_domain = ko.computed(() => {
            return this.provider() === "email";
        });
    }
}
Registry.add_view(OrganizationSettingsAuthorizationView);


/**
 * Organization creation
 */
export class OrganizationCreateView {
  static view_name = "OrganizationCreateView";

  constructor() {
    const nameInput = document.querySelector("input[name=name");
    const slugInput = document.querySelector("input[name=slug]");

    const slugify = (val) => {
      return (
        val
          .toString()
          .toLowerCase()
          .trim()
          // Replace spaces, non-word chars, underscores and dashes with a single '-'
          // Copied from Django, which is what we are using under the hood
          // https://github.com/django/django/blob/1e9db35/django/utils/text.py#L469-L470
          .replace(/[^\w\s-_]+/g, "-")
          .replace(/[-\s]+/g, "-")
      );
    };

    nameInput.addEventListener("keyup", (e) => {
      slugInput.setAttribute("value", slugify(nameInput.value));
    });
  }
}
Registry.add_view(OrganizationCreateView);
