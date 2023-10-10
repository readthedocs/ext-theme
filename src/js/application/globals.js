/**
 * Global imports workaround
 *
 * This import is used mostly during testing and for jQuery dependencies.
 * Because jQuery plugins and downstream libraries use jQuery as a
 * global/window object, we need to surface the library in the same way during
 * testing. In normal usage, jQuery is in our vendor library and Webpack knows
 * how to treat reference the external vendor library for instances of a
 * global/window jQuery variable.
 *
 * In testing, this accomplishes the same thing. It's defined in a separate
 * import as the import will be evaluated first, giving a chance to attach
 * `window.jQuery` before the other dependencies, like jQuery plugins and all
 * of FomanticUI's component, are imported.
 */

import jquery from "jquery";
globalThis.jQuery = jquery;
