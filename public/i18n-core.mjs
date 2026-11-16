/** Shared by prerendering, interactive React UI and progressive enhancement. */
export const normalizeText = (value) => value.replace(/\s+/g, ' ').trim();
export function translateText(value, dictionary) {
  if (typeof value !== 'string' || !value.trim()) return value;
  const key = normalizeText(value);
  let translated = Object.hasOwn(dictionary, key) ? dictionary[key] : undefined;
  if (!translated) {
    const patterns = [
      [/^Delete (.+)$/, (_, name) => `删除 ${name}`],
      [/^Actions for (.+)$/, (_, name) => `${name} 的操作`],
      [/^Copy (.+) value (.+)$/, (_, name, value) => `复制 ${name} 的值 ${value}`],
      [/^(\d+) results$/, (_, n) => `${n} 条结果`],
      [/^View (.+) skills$/, (_, name) => `查看 ${name} 的技能`],
      [/^View (.+) on GitHub$/, (_, name) => `在 GitHub 查看 ${name}`],
      [/^Open (.+) on GitHub$/, (_, name) => `在 GitHub 打开 ${name}`],
      [/^Open (.+) website$/, (_, name) => `访问 ${name} 官网`],
      [/^(.+) avatar$/, (_, name) => `${name} 的头像`],
      [/^(.+) GitHub stars$/, (_, n) => `${n} 个 GitHub 星标`],
      [/^Remove (.+) from saved skills$/, (_, name) => `取消收藏 ${name}`],
      [/^(\d+) skills?$/, (_, n) => `${n} 个技能`],
      [/^(\d+) collections?$/, (_, n) => `${n} 个专题合集`],
    ];
    for (const [pattern, render] of patterns) if (pattern.test(key)) { translated = key.replace(pattern, render); break; }
  }
  return translated ? value.replace(/\S[\s\S]*\S|\S/, () => translated) : value;
}
export function localizedHref(value, chinese) {
  if (!value?.startsWith('/') || value.startsWith('//')) return value;
  if (/^\/(?:jobs|sponsor|oauth)(?:\/|$)/.test(value)) return 'https://www.ui-skills.com' + value;
  if (/^\/mcp(?:\/rpc)?\/?(?:[?#]|$)/.test(value)) return value;
  if (!chinese && !/^\/en(?:\/|$)/.test(value) && !/\.[a-z0-9]+(?:[/?#]|$)/i.test(value) && !/^\/(?:api|\.well-known)(?:\/|$)/.test(value)) return '/en' + value;
  return value;
}
let loading;
export function loadTranslations() {
  if (!loading) loading = fetch('/i18n/zh-CN.json').then(response => {
    if (!response.ok) throw new Error('Translation catalog unavailable');
    return response.json();
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
