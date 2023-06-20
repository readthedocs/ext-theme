import jquery from "jquery";
import ko from "knockout";
import { loadStripe } from "@stripe/stripe-js/pure";

import { Registry } from "../application/registry";

class StripeCheckoutView {
  static view_name = "StripeCheckoutView";

  constructor(config) {
    this.stripeKey = config.stripeKey || "";
    this.checkoutSessionUrl = config.checkoutSessionUrl || "";
    this.csrfToken = config.csrfToken || "";

    this.stripe = ko.observable();
    this.stripeLoading = ko.observable(true);

    this.priceId = ko.observable();

    this.initializeStripe();
  }

  /**
   * Load Stripe JS client dynamically
   *
   * The package installed through NPM is just a wrapper for the Stripe hosted
   * JS, which is required for PCI compliance. We treat this similar to a Webpack
   * dynamic import and wait to load the library until doing anything with it.
   * The form element will appear disabled while the library is loading.
   */
  initializeStripe() {
    return loadStripe(this.stripeKey).then((stripe) => {
      this.stripe(stripe);
      this.stripeLoading(false);
    });
  }

  /**
   * Click event handler for the Gold subscription form
   *
   * This posts to an internal URL to generate the Stripe checkout session and
   * then redirects the user
   */
  createCheckoutSession() {
    this.stripeLoading(true);

    fetch(this.checkoutSessionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken,
      },
      body: JSON.stringify({
        priceId: this.priceId(),
      }),
    })
      .then((result) => {
        this.stripeLoading(false);
        result.json().then((data) => {
          this.stripe().redirectToCheckout({ sessionId: data.session_id });
        });
      })
      .catch((err) => {
        this.stripeLoading(false);
      });
  }
}

Registry.add_view(StripeCheckoutView);
