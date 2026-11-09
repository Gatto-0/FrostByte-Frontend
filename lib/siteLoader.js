// Site loader controller (browser only). Small: no images, no styles.
// Needs the server-rendered cover from siteLoaderCover.js (<div id="site-loader">).
//
// initSiteLoader({ extraImages: ["/hero.png"], minMs: 700, maxMs: 12000 })
//   waits for: window "load" + fonts + extraImages + visible <img>s, then fades the cover out.
//   minMs avoids a flash on fast loads; maxMs is a safety timeout so it can never get stuck.

export function initSiteLoader(opts = {}) {
  if (typeof window === "undefined" || window.__siteLoaderStarted) return;
  const root = document.getElementById("site-loader");
  if (!root) { console.warn("siteLoader: #site-loader not found; render the cover on the server."); return; }
  window.__siteLoaderStarted = true;
  const { extraImages = [], minMs = 700, maxMs = 12000 } = opts;
  const t0 = performance.now();

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const pageLoaded = document.readyState === "complete"
    ? Promise.resolve()
    : new Promise((r) => addEventListener("load", r, { once: true }));
  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
  const preload = extraImages.map((src) => new Promise((res) => {
    const i = new Image();
    i.onload = i.onerror = res;
    i.src = src;
  }));
  const visibleImgs = () => Promise.all(
    Array.from(document.images)
      .filter((i) => i.loading !== "lazy" && !i.complete && !root.contains(i))
      .map((i) => new Promise((res) => {
        i.addEventListener("load", res, { once: true });
        i.addEventListener("error", res, { once: true });
      }))
  );
  const ready = Promise.all([pageLoaded, fontsReady, ...preload]).then(visibleImgs);
  const timeout = new Promise((r) => setTimeout(r, maxMs));

  Promise.race([ready, timeout]).then(() => {
    const wait = Math.max(0, minMs - (performance.now() - t0));
    setTimeout(() => {
      root.classList.add("sl-out");
      setTimeout(() => {
        document.body.style.overflow = prevOverflow;
        root.style.display = "none"; // hide, don't remove: React owns this node
      }, 650);
    }, wait);
  });
}
