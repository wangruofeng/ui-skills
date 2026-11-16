import { useEffect, useState } from "react";
import translations from "../data/account-interface.json";

/** English first render matches static HTML; localize after React has hydrated. */
export function useAccountText() {
  const [chinese, setChinese] = useState(false);
  useEffect(() => {
    setChinese(!/^\/en(?:\/|$)/.test(location.pathname));
  }, []);
  return (text: string) =>
    chinese ? ((translations as Record<string, string>)[text] ?? text) : text;
}
