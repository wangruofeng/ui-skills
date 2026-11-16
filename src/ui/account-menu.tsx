import { useUiTree } from "../lib/ui-localization";
import { useAccountText } from "../lib/account-interface";
import {
  ArrowRightStartOnRectangleIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "./menu";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { clearLibraryCache } from "../lib/library-client";
import { getCachedSession } from "../lib/session-client";

type AccountUser = {
  email: string;
  image: string | null;
  initial: string;
};

export function AccountMenu() {
  const localizeUi = useUiTree();

  const t = useAccountText();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCachedSession()
      .then(({ data }) => {
        if (!active) return;
        const sessionUser = data?.user;
        if (!sessionUser) return;
        const label = sessionUser.name || sessionUser.email;
        setUser({
          email: sessionUser.email,
          image: sessionUser.image ?? null,
          initial: label.trim().charAt(0).toUpperCase() || "?",
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const signOut = () => {
    setPending(true);
    setError(null);
    authClient
      .signOut()
      .then((result) => {
        if (result.error) throw new Error("Sign-out failed");
        clearLibraryCache();
        window.location.assign(
          location.pathname.startsWith("/en/") ? "/en/" : "/",
        );
      })
      .catch(() => {
        setPending(false);
        setError("Sign-out failed. Please try again.");
      });
  };

  if (!user) return null;

  return localizeUi(
    <Menu.Root>
      <Menu.Trigger
        className="focus-visible:outline-content-primary inline-flex size-8 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:outline-1 focus-visible:outline-offset-2"
        aria-label={t("Account")}
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            width="32"
            height="32"
            className="border-line-default size-8 rounded-full border object-cover"
          />
        ) : (
          <span className="border-line-default bg-surface-subtle text-content-secondary type-body-sm inline-flex size-8 items-center justify-center rounded-full border font-[450]">
            {user.initial}
          </span>
        )}
      </Menu.Trigger>
      <Menu.Popup className="w-64 rounded-xl px-1 py-1">
        <div className="flex min-w-0 items-center gap-2 px-2 pt-1.5 pb-1">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              width="20"
              height="20"
              className="border-line-default size-5 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <span className="border-line-default bg-surface-subtle text-content-secondary inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-[450]">
              {user.initial}
            </span>
          )}
          <p className="type-body-sm text-content-secondary min-w-0 truncate">
            {user.email}
          </p>
        </div>
        <Menu.LinkItem href="/library">
          <FolderIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("My favorites")}
        </Menu.LinkItem>
        <Menu.Separator />
        <Menu.Item disabled={pending} onClick={signOut}>
          <ArrowRightStartOnRectangleIcon
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          {t("Sign out")}
        </Menu.Item>
        {error ? (
          <p
            role="alert"
            className="type-body-sm text-content-secondary px-2 py-1 text-pretty"
          >
            {t(error)}
          </p>
        ) : null}
      </Menu.Popup>
    </Menu.Root>,
  );
}
