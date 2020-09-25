import { Application } from "../application";
import { ApplicationView } from "../application/views";

test("Application view has subviews", () => {
  const app = new ApplicationView();
  expect(app.BuildDetailView).toBeDefined();
  expect(app.MessageView).toBeDefined();
});

test("Application view subviews return instances", () => {
  const app = new ApplicationView();
  const view = app.EmbedTopicsView();
  expect(view.constructor.name).toBe("EmbedTopicsView");
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
