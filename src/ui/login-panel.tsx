import { useUiTree } from "../lib/ui-localization";
import { useAccountText } from "../lib/account-interface";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { safeReturnTo } from "../lib/auth-config";
import { clearLibraryCache } from "../lib/library-client";
import { clearCachedSession } from "../lib/session-client";
export function LoginPanel() {
  const localizeUi = useUiTree();

  const t = useAccountText();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    if (new URLSearchParams(location.search).has("error"))
      setError("Sign-in was not completed. Please try again.");
    fetch("/api/auth/status", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        setReady(data.github === true);
        if (!data.github) setError("GitHub sign-in is not available yet.");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Unable to check sign-in. Reload to retry.");
      });
    return () => controller.abort();
  }, []);
  async function signIn() {
    setPending(true);
    setError("");
    try {
      clearLibraryCache();
      clearCachedSession();
      const params = new URLSearchParams(location.search);
      const prefix = location.pathname.startsWith("/en/") ? "/en" : "";
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: safeReturnTo(
          params.get("returnTo") ?? `${prefix}/library/`,
        ),
        errorCallbackURL: `${prefix}/login/?error=oauth`,
      });
      if (result.error) throw Error();
    } catch {
      setError("Unable to start sign-in. Please try again.");
      setPending(false);
    }
  }
  return localizeUi(
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        disabled={!ready || pending}
        aria-busy={pending}
        onClick={signIn}
        className="type-body-md bg-fill-inverse text-content-inverse rounded-lg px-4 py-3 disabled:opacity-50"
      >
        {pending ? t("Signing in…") : t("Continue with GitHub")}
      </button>
      <p className="type-body-sm text-content-secondary text-center">
        {t("Sign in to save skills across devices.")}
      </p>
      {error && (
        <p
          role="alert"
          className="type-body-md text-content-secondary text-center"
        >
          {t(error)}
        </p>
      )}
    </div>,
  );
}
