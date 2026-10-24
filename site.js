const navigation = document.querySelector("details.menu");

if (navigation) {
  let desktopNavigation = window.innerWidth > 672;
  navigation.open = desktopNavigation;

  window.addEventListener("resize", () => {
    const nowDesktop = window.innerWidth > 672;
    if (nowDesktop !== desktopNavigation) {
      navigation.open = nowDesktop;
      desktopNavigation = nowDesktop;
    }
  });
}

const artwork = document.querySelector("[data-artwork]");

if (artwork) {
  const designs = ["art-holds", "art-crag", "art-route", "art-belay"];
  const design = designs[Math.floor(Math.random() * designs.length)];
  artwork.classList.add(design);
}
