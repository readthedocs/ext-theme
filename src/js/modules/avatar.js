import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import pureRand from "pure-rand";

import { LightDOMElement } from "../application/elements";

export class AvatarElement extends LitElement {
  static properties = {
    seed: { type: String },
  };

  static styles = css`
    :host {
      width: 40px,
      height: 40px,
    }

    :host > canvas {
      display: inline-block;
      width: 40px,
      height: 40px,
    }
  `;

  render() {
    return html`<canvas id="avatar"></canvas>`;
  }

  updated(changed) {
    // Dynamically update background position through CSS variables. The
    // ``styles`` attribute does not work with dynamic rules, but we can do the
    // same after an updated event on the web component.
    if (changed.has("seed") && this.seed) {
      const rng = pureRand.xoroshiro128plus(this.seed);
      const avatar = this.renderRoot.querySelector("#avatar");
      const ctx = avatar.getContext("2d");

      let posX;
      let posY;
      // https://colorhunt.co/palette/77e4c836c2ce478ccf4535c1
      const colors = ["#77E4C8", "#36C2CE", "#478CCF", "#4535C1"];

      // Initial color
      ctx.fillStyle = colors[pureRand.unsafeUniformIntDistribution(0, 3, rng)];
      ctx.fillRect(0, 0, 40, 40);

      // Draw some white pixels in the image
      ctx.fillStyle = "white";
      for (let i = 0; i < 30; i++) {
        posX = pureRand.unsafeUniformIntDistribution(0, 40, rng);
        posY = pureRand.unsafeUniformIntDistribution(0, 40, rng);

        ctx.fillRect(posX, posY, 5, 5);
      }
    }
  }
}

customElements.define("readthedocs-avatar", AvatarElement);
