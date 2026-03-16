export const hideBotpress = () => {

  const elements = document.querySelectorAll(
    "#bp-web-widget-container, .bpFab, .bpWebchat, iframe[src*='botpress']"
  );

  elements.forEach((el) => {
    el.style.display = "none";
  });

};

export const showBotpress = () => {

  const elements = document.querySelectorAll(
    "#bp-web-widget-container, .bpFab, .bpWebchat, iframe[src*='botpress']"
  );

  elements.forEach((el) => {
    el.style.display = "block";
  });

};
