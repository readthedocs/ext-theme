import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import pureRand from "pure-rand";

import { LightDOMElement } from "../application/elements";

// TODO figure out how to load this image from URL correctly
import avatarImage from "../../css/images/avatar-1.png";

export class AvatarElement extends LitElement {
  static properties = {
    seed: { type: String },
  };

  static styles = css`
    :host {
      --avatar-x: 0;
      --avatar-y: 0;
    }

    div {
      background-size: 1000px 1000px;
      background-image: url("http://assets.devthedocs.org:10001/readthedocsext/theme/${unsafeCSS(
        avatarImage,
      )}");
      width: 40px;
      height: 40px;
      image-rendering: pixelated;
      background-repeat: no-repeat;
      background-position-x: calc(var(--avatar-x, 0) * -10px);
      background-position-y: calc(var(--avatar-y, 0) * -10px);
    }
  `;

  render() {
    return html`<div></div>`;
  }

  // Dynamically update CSS properties. The ``styles`` attribute does not work
  // with dynamic rules, but we can do the same after an updated event on the
  // web component.
  updated(changed) {
    if (changed.has("seed") && this.seed) {
      const rng = pureRand.xoroshiro128plus(this.seed);
      const posX = pureRand.unsafeUniformIntDistribution(0, 99, rng);
      const posY = pureRand.unsafeUniformIntDistribution(0, 99, rng);
      this.style.setProperty("--avatar-x", posX);
      this.style.setProperty("--avatar-y", posY);
    }
  }
}

customElements.define("readthedocs-avatar", AvatarElement);
