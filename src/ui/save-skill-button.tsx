import { useUiTree } from "../lib/ui-localization";
import { useAccountText } from "../lib/account-interface";
import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { getCachedSession } from "../lib/session-client";
import {
  fetchLibrary,
  saveSkill,
  unsaveSkill,
  writeLibraryCache,
} from "../lib/library-client";
export function SaveSkillButton({ skillPath }: { skillPath: string }) {
  const localizeUi = useUiTree();

  const t = useAccountText();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getCachedSession()
      .then(async ({ data }) => {
        if (!data?.user) return;
        const result = await fetchLibrary();
        if (active)
          setSaved(result.library.savedSkillPaths.includes(skillPath));
      })
      .catch(() => {
        if (active) setError("Unable to load favorites. Please try again.");
      });
    return () => {
      active = false;
    };
  }, [skillPath]);
  async function toggle() {
    setPending(true);
    setError("");
    try {
      const { data } = await getCachedSession();
      if (!data?.user) {
        const prefix = location.pathname.startsWith("/en/") ? "/en" : "";
        location.assign(
          `${prefix}/login/?returnTo=${encodeURIComponent(location.pathname + location.search)}`,
        );
        return;
      }
      const result = await (saved
        ? unsaveSkill(skillPath)
        : saveSkill(skillPath));
      writeLibraryCache(result.library);
      setSaved(result.library.savedSkillPaths.includes(skillPath));
    } catch {
      setError("Unable to update favorites. Please try again.");
    } finally {
      setPending(false);
    }
  }
  const Icon = saved ? StarSolidIcon : StarIcon;
  return localizeUi(
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={saved ? t("Remove from favorites") : t("Add to favorites")}
        title={saved ? t("Remove from favorites") : t("Add to favorites")}
        aria-pressed={saved}
        disabled={pending}
        aria-busy={pending}
        onClick={toggle}
        className="text-content-secondary hover:bg-fill-subtle focus-visible:outline-content-primary inline-flex size-8 shrink-0 items-center justify-center rounded-lg focus-visible:outline-1 disabled:opacity-50"
      >
        <Icon
          className={saved ? "text-content-accent size-4" : "size-4"}
          aria-hidden="true"
        />
      </button>
      {error && (
        <span
          role="alert"
          className="type-body-sm text-content-secondary max-w-44"
        >
          {t(error)}
        </span>
      )}
    </div>,
  );
}
