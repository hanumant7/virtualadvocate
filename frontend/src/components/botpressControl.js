const BOTPRESS_SELECTORS = [
  "#bp-web-widget-container",
  ".bpFab",
  ".bpWebchat",
  "iframe[src*='botpress']",
];

function toggleBotpress(show) {
  BOTPRESS_SELECTORS.forEach((selector) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      el.style.visibility = show ? "visible" : "hidden";
      el.style.opacity = show ? "1" : "0";
      el.style.pointerEvents = show ? "auto" : "none";
    });
  });
}

export const hideBotpress = () => {
  toggleBotpress(false);
};

export const showBotpress = () => {
  toggleBotpress(true);
};
