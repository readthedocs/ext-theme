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

export class OrganizationCreateView {
  static view_name = "OrganizationCreateView";

  constructor() {
    // Enabling tab switching on a list
    $(".list .item").tab();
  }
}
Registry.add_view(OrganizationCreateView);
