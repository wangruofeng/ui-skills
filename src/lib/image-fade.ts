/** Progressive enhancement: native images remain visible without JavaScript. */
export function installImageFades() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Map<HTMLImageElement, Animation>();
  const timeouts = new Map<HTMLImageElement, number>();
  const observed = new WeakSet<HTMLImageElement>();
  function reset(image: HTMLImageElement) {
    animations.get(image)?.cancel();
    animations.delete(image);
    const timeout = timeouts.get(image);
    if (timeout !== undefined) window.clearTimeout(timeout);
    timeouts.delete(image);
  }
  function fadeIn(image: HTMLImageElement) {
    reset(image);
    if (reducedMotion.matches || !image.isConnected || !image.naturalWidth || !image.animate) return;
    const animation = image.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: "ease-out",
    });
    animations.set(image, animation);
    animation.onfinish = () => {
      if (animations.get(image) === animation) animations.delete(image);
    };
  }
  function fadeOut(image: HTMLImageElement) {
    const opacity = getComputedStyle(image).opacity;
    reset(image);
    if (reducedMotion.matches || !image.animate) return;
    if (image.complete) {
      // Cached replacements may finish before the mutation observer runs.
      if (image.naturalWidth) fadeIn(image);
      return;
    }
    animations.set(image, image.animate([{ opacity }, { opacity: 0 }], {
      duration: 140,
      easing: "ease-in",
      fill: "forwards",
    }));
    // A stalled request must never leave an image or its native alt text hidden.
    timeouts.set(image, window.setTimeout(() => reset(image), 5000));
  }
  function observe(image: HTMLImageElement) {
    if (observed.has(image)) return;
    observed.add(image);
    if (image.complete && image.naturalWidth) fadeIn(image);
  }
  function scan(node: Node) {
    if (node instanceof HTMLImageElement) observe(node);
    if (node instanceof Element || node instanceof Document) node.querySelectorAll("img").forEach(observe);
  }
  document.addEventListener("load", event => {
    if (event.target instanceof HTMLImageElement) {
      observed.add(event.target);
      fadeIn(event.target);
    }
  }, true);
  document.addEventListener("error", event => {
    if (event.target instanceof HTMLImageElement) reset(event.target);
  }, true);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "attributes" && record.target instanceof HTMLImageElement) {
        if (record.oldValue !== record.target.getAttribute(record.attributeName!)) fadeOut(record.target);
      } else {
        record.addedNodes.forEach(scan);
        record.removedNodes.forEach(node => {
          for (const image of animations.keys()) if (node === image || node.contains(image)) reset(image);
        });
      }
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["src", "srcset", "sizes"] });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) for (const image of animations.keys()) reset(image);
  });
  scan(document);
}
