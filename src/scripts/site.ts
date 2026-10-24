export {};

const navDetails = document.querySelector<HTMLDetailsElement>("details.menu");

if (navDetails) {
  let desktopNavigation = window.innerWidth > 672;
  navDetails.open = desktopNavigation;
  window.addEventListener("resize", () => {
    const nowDesktop = window.innerWidth > 672;
    if (nowDesktop !== desktopNavigation) {
      navDetails.open = nowDesktop;
      desktopNavigation = nowDesktop;
    }
  });
}

const artwork = document.querySelector<HTMLElement>("[data-artwork]");
if (artwork) {
  const designs = ["art-holds", "art-crag", "art-route", "art-belay"];
  artwork.classList.add(designs[Math.floor(Math.random() * designs.length)]);
}
