import { expect } from "@open-wc/testing";

import { Application } from "../application";
import { ApplicationView } from "../application/views";

describe("Application", () => {
  it("has registered views", () => {
    const app = new Application();
    expect(app.registry.constructor.views.BuildDetailView).to.not.be.undefined;
    expect(app.registry.constructor.views.ProjectListView).to.not.be.undefined;
  });

  it("exposes registered views on all registered views", () => {
    const app = new Application();
    const view = new ApplicationView();
    app.registry.attach(view);
    expect(view.BuildDetailView).to.not.be.undefined;
    expect(view.ProjectListView).to.not.be.undefined;
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
});
