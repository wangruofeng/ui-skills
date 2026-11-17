const requests = (globalThis.uiSkillsPublicData ??= new Map());

export function loadPublicJson(path, versionAttribute, validate) {
  const version = document.documentElement.dataset[versionAttribute];
  const url = new URL(path, location.origin);
  if (version) url.searchParams.set('v', version);
  const key = url.href;

  if (!requests.has(key)) {
    requests.set(key, readJson(path, url, version, validate).catch(error => {
      requests.delete(key);
      throw error;
    }));
  }
  return requests.get(key);
}

async function readJson(path, url, version, validate) {
  let cache;
  if (version) {
    try {
      cache = await caches.open('ui-skills-public-data');
      const stored = await cache.match(path);
      if (stored?.url === url.href) {
        const data = await stored.json();
        if (validate(data)) return data;
      }
    } catch {
      // A blocked or unreadable browser cache falls back to the network.
    }
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  const copy = cache ? response.clone() : null;
  const data = await response.json();
  if (!validate(data)) throw new Error(`Invalid data from ${path}`);

  if (copy) {
    await cache.put(path, copy).catch(() => {});
  }
  return data;
}
