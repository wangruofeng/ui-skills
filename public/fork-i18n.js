(async () => {
  const {loadTranslations, translateText, localizedHref} = await import('/i18n-core.mjs');
  const zh = !/^\/en(?:\/|$)/.test(location.pathname);
  const words = zh ? await loadTranslations().catch(() => ({})) : {};
  const translate = text => zh ? translateText(text, words) : text;
  function visit(root) {
    const element = root.nodeType === 1 ? root : root.parentElement;
    // React owns its text and attributes. Localize those during React render.
    if (element?.closest('astro-island')) return;
    if (root.nodeType === 3) {
      if (!element?.closest('[data-original-content],[translate="no"],pre,code,script,style,svg')) {
        const value = translate(root.nodeValue); if (value !== root.nodeValue) root.nodeValue = value;
      }
      return;
    }
    if (root.nodeType !== 1 && root !== document) return;
    if (root.nodeType === 1) {
      if (root.matches('[data-language-switch]')) {
        root.href = (zh ? '/en' : '') + (location.pathname.replace(/^\/en(?=\/|$)/, '') || '/') + location.search + location.hash;
        root.textContent = zh ? 'EN' : '中文'; root.setAttribute('aria-label', zh ? 'Switch to English' : '切换到中文'); return;
      }
      if (root.matches('script,style,pre,code,svg,[data-original-content],[translate="no"]')) return;
      for (const name of ['href','data-card-href']) if (root.hasAttribute(name)) {
        const value = localizedHref(root.getAttribute(name), zh); if (value !== root.getAttribute(name)) root.setAttribute(name, value);
      }
      for (const name of ['aria-label','placeholder','title','alt']) if (root.hasAttribute(name)) {
        const value = translate(root.getAttribute(name)); if (value !== root.getAttribute(name)) root.setAttribute(name, value);
      }
    }
    [...root.childNodes].forEach(visit);
  }
  visit(document);
  new MutationObserver(records => { for (const r of records) { if (r.type === 'characterData') visit(r.target); else r.addedNodes.forEach(visit); } }).observe(document.body, {subtree:true,childList:true,characterData:true});
  window.__uiSkillsI18n = {words,translate};
})();
