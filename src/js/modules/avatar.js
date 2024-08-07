import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import pureRand from "pure-rand";

import { LightDOMElement } from "../application/elements";

// This image lives alongside our CSS sources, and bundling outputs this image
// to the application static path. From here, Django ``static`` template tag is
// used to reference the file through storage. So, this import is not directly
// needed here, and this might be a pattern to redo eventually.
import avatarImage from "../../css/images/avatar-1.png";

export class AvatarElement extends LitElement {
  static properties = {
    seed: { type: String },
    url: { type: String },
  };

  static styles = css`
    :host {
      --avatar-x: 0;
      --avatar-y: 0;
      --avatar-scale: -10px;
      --avatar-background-image: none;
    }

    :host > div {
      background-image: var(--avatar-background-image);
      background-repeat: no-repeat;
      background-size: calc(100 * -1 * var(--avatar-scale))
        calc(100 * -1 * var(--avatar-scale));
      background-position-x: calc(var(--avatar-x) * var(--avatar-scale));
      background-position-y: calc(var(--avatar-y) * var(--avatar-scale));
      image-rendering: pixelated;
      width: calc(var(--avatar-scale) * -4);
      height: calc(var(--avatar-scale) * -4);
    }

    :host(.micro.image) > div {
      --avatar-scale: -6px;
    }
  `;

  render() {
    return html`<div></div>`;
  }

  updated(changed) {
    // Dynamically update background position through CSS variables. The
    // ``styles`` attribute does not work with dynamic rules, but we can do the
    // same after an updated event on the web component.
    if (changed.has("seed") && this.seed) {
      const rng = pureRand.xoroshiro128plus(this.seed);
      const posX = pureRand.unsafeUniformIntDistribution(0, 99, rng);
      const posY = pureRand.unsafeUniformIntDistribution(0, 99, rng);
      this.style.setProperty("--avatar-x", posX);
      this.style.setProperty("--avatar-y", posY);
    }
    // Similarly, load the image through the avatar URL attribute, as we want
    // the fully resolved storage URL from Django staticfiles.
    if (changed.has("url") && this.url) {
      this.style.setProperty("--avatar-background-image", `url("${this.url}")`);
    }
  }
}

customElements.define("readthedocs-avatar", AvatarElement);
