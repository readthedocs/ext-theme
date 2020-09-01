import jquery from "jquery";
import { Application } from "./application";

jquery(document).ready(() => {
  const app = new Application();
  app.run();
});
