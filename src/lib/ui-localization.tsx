import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  loadTranslations,
  translateText,
  localizedHref,
} from "../../public/i18n-core.mjs";
type Dictionary = Record<string, string>;

export const UiLocaleContext = createContext<{
  chinese: boolean;
  dictionary: Dictionary;
} | null>(null);

export function useUiText() {
  const locale = useContext(UiLocaleContext);
  const [loadedDictionary, setLoadedDictionary] = useState<Dictionary | null>(null);
  const dictionary = loadedDictionary ?? locale?.dictionary;
  useEffect(() => {
    if (!(locale?.chinese ?? !/^\/en(?:\/|$)/.test(location.pathname))) return;
    let active = true;
    loadTranslations()
      .then((words) => {
        if (active) setLoadedDictionary(words);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [locale?.chinese]);
  return useCallback(
    (value: string) =>
      dictionary ? translateText(value, dictionary) : value,
    [dictionary],
  );
}
/** Translate React-owned text during render; never mutate a hydrated island's DOM. */
export function localizeUiTree(
  node: ReactNode,
  t: (value: string) => string,
  chinese: boolean,
): ReactNode {
  if (typeof node === "string") return t(node);
  if (!isValidElement<Record<string, unknown>>(node)) return node;
  const props = node.props;
  if (
    ["pre", "code", "script", "style", "svg"].includes(node.type as string) ||
    "data-original-content" in props || props.translate === "no"
  )
    return node;
  const next: Record<string, unknown> = {};
  for (const key of [
    "aria-label",
    "title",
    "placeholder",
    "alt",
    "label",
    "description",
    "content",
  ]) {
    if (typeof props[key] === "string") next[key] = t(props[key]);
  }
  if (typeof props.href === "string")
    next.href = localizedHref(props.href, chinese);
  if (props.children !== undefined) next.children = Array.isArray(props.children)
    ? props.children.map(child => localizeUiTree(child, t, chinese))
    : localizeUiTree(props.children as ReactNode, t, chinese);
  return cloneElement(node, next);
}
export function useUiTree() {
  const t = useUiText();
  const locale = useContext(UiLocaleContext);
  // Islands without a locale use the same link paths on the server and first render.
  const [chinese, setChinese] = useState(true);
  useEffect(() => {
    if (!locale) setChinese(!/^\/en(?:\/|$)/.test(location.pathname));
  }, [locale]);
  return (node: ReactNode) => localizeUiTree(node, t, locale?.chinese ?? chinese);
}
