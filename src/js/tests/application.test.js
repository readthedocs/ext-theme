import { expect } from "@open-wc/testing";

import jquery from "jquery";

import { Application } from "../application";
import { ApplicationView } from "../application/views";

describe("Application", () => {
  it("has registered views", () => {
    const app = new Application();
    expect(app.registry.constructor.views.BuildDetailView).to.not.be.undefined;
    expect(app.registry.constructor.views.ProjectListItemView).to.not.be
      .undefined;
  });

  it("exposes registered views on all registered views", () => {
    const app = new Application();
    const view = new ApplicationView();
    app.registry.attach(view);
    expect(view.BuildDetailView).to.not.be.undefined;
    expect(view.ProjectListItemView).to.not.be.undefined;
  });

  it("can load site configuration", async () => {
    const app = new Application();
    document.body.innerHTML = `
      <script type="application/json" id="site-config">
        {"debug": true}
      </script>
    `;
    const config = app.load_config();
    expect(config.webpack_public_path).to.be.undefined;
    expect(config.debug).to.be.true;
    expect(window.__webpack_public_path).to.be.undefined;
  });

  it("only tracks analytics when enabled in site configuration", () => {
    document.body.innerHTML = `
      <script type="application/json" id="site-config">
        {"analytics_enabled": false}
      </script>
    `;
    const app = new Application();
    app.load_config();
    app.configure_plugins();
    let calls = 0;
    jquery.fn.plausible = function () {
      calls++;
      return this;
    };

    app.add_jquery_plugins();
    expect(calls).to.equal(0);

    app.config.analytics_enabled = true;
    app.add_jquery_plugins();
    expect(calls).to.equal(1);
  });
});
