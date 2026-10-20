import { expect } from "@open-wc/testing";

import {
  isAutomatedBrowser,
  trackPageviewWhenVisible,
} from "../../application/plugins";

describe("isAutomatedBrowser", () => {
  afterEach(() => {
    delete window._phantom;
    delete window.__plausible;
  });

  // The test runner drives a real browser, so ``navigator.webdriver`` is set
  it("detects the test runner as an automated browser", () => {
    expect(window.navigator.webdriver).to.be.true;
    expect(isAutomatedBrowser()).to.be.true;
  });

  it("detects headless browser globals", () => {
    window._phantom = {};
    expect(isAutomatedBrowser()).to.be.true;
  });

  it("can be overridden with window.__plausible", () => {
    window.__plausible = true;
    expect(isAutomatedBrowser()).to.be.false;
  });
});

describe("trackPageviewWhenVisible", () => {
  const setVisibility = (state) => {
    Object.defineProperty(document, "visibilityState", {
      value: state,
      configurable: true,
    });
  };

  afterEach(() => {
    setVisibility("visible");
  });

  it("tracks immediately when the page is visible", () => {
    let calls = 0;
    setVisibility("visible");
    trackPageviewWhenVisible(() => calls++);
    expect(calls).to.equal(1);
  });

  it("waits until a hidden page becomes visible", () => {
    let calls = 0;
    setVisibility("hidden");
    trackPageviewWhenVisible(() => calls++);
    expect(calls).to.equal(0);

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(calls).to.equal(1);

    // Only the first pageview is tracked
    document.dispatchEvent(new Event("visibilitychange"));
    expect(calls).to.equal(1);
  });
});
