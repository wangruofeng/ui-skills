import {
  cloneElement,
  isValidElement,
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
const passthrough = (value: string) => value;
export function useUiText() {
  const [dictionary, setDictionary] = useState<Record<string, string> | null>(
    null,
  );
  useEffect(() => {
    if (/^\/en(?:\/|$)/.test(location.pathname)) return;
    let active = true;
    loadTranslations()
      .then((words) => {
        if (active) setDictionary(words);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return useCallback(
    (value: string) =>
      dictionary ? translateText(value, dictionary) : passthrough(value),
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
  // First render matches the English SSR output, including links.
  const [chinese, setChinese] = useState(true);
  useEffect(() => {
    setChinese(!/^\/en(?:\/|$)/.test(location.pathname));
  }, []);
  return (node: ReactNode) => localizeUiTree(node, t, chinese);
}
