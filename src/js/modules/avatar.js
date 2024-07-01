import { LitElement, css, html, nothing, unsafeCSS } from "lit";

import { LightDOMElement } from "../application/elements";

import avatarImage from "../../css/images/avatar-1.png";

export class AvatarElement extends LitElement {
  static properties = {
    seed: { type: String },
  }

  // TODO figure out how to load this image from URL correctly
  // TODO better image, using now:
  // https://unsplash.com/photos/portland-oregon-old-town-neon-signage-during-night-time-ZB_Ns0hVZNk
  static styles = css`
    div {
      background-size: 1000px 1000px;
      background-image: url("http://assets.devthedocs.org:10001/readthedocsext/theme/${unsafeCSS(avatarImage)}");
      width: 40px;
      height: 40px;
      image-rendering: pixelated;
      background-repeat: no-repeat;
      background-position-x: -500;
      background-position-y: -500;
    }
  `;

  // TODO this was just copied from an xor 32bit hashing function, spruce this
  // up and understand it a bit more, as we probably want to be able to pull two
  // 7 bit numbers from this (integer 0-127, corresponding to the x/y offset of
  // a 128x128px image)
  xorshift32(a) {
    a ^= a << 13;
    a ^= a >>> 17;
    a ^= a << 5;
    return (a >>> 0) / 4294967296;
  }

  // TODO find a better hashing function
  getX() {
    return (this.seed % 100) * -10;
  }

  // TODO find a better hashing function
  getY() {
    return (this.seed % 100) * -10;
  }

  // TODO maybe don't do inline styles here either
  render() {
    return html`<div style="background-position-x: ${this.getX()}px; background-position-y: ${this.getY()}px;"></div>`;
  }
}

customElements.define("readthedocs-avatar", AvatarElement);
