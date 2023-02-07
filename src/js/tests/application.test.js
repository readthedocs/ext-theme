import { Application } from "../application";
import { ApplicationView } from "../application/views";

test("Application registry is loaded", () => {
  const app = new Application();
  expect(app.registry.constructor.views).toHaveProperty("BuildDetailView");
  expect(app.registry.constructor.views).toHaveProperty("ProjectListView");
});

test("Application view has subviews", () => {
  const app = new Application();
  const view = new ApplicationView();
  app.registry.attach(view);

  expect(view.BuildDetailView).toBeDefined();
  expect(view.ProjectListView).toBeDefined();
  // TODO this is missing?
  //expect(view.MessageView).toBeDefined();
});

test("Application load default config", () => {
  const app = new Application();
  document.body.innerHTML =
    '<script type="application/json" id="site-config">{}</script>';
  const config = app.load_config();
  expect(config.webpack_public_path).toBeUndefined();
  expect(config.debug).toBeFalsy();
  expect(window.__webpack_public_path).toBeUndefined();
});

test("Application load custom config", () => {
  const app = new Application();
  document.body.innerHTML = `
  <script type="application/json" id="site-config">
  {
    "webpack_public_path": "/foo",
    "debug": true
  }
  </script>`;
  const config = app.load_config();
  expect(config.debug).toBeTruthy();
  expect(config.webpack_public_path).toBe("/foo");
  expect(global.__webpack_public_path__).toBe("/foo");
});
