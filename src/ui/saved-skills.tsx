import { UiLocaleContext } from "../lib/ui-localization";
import { loadTranslations, translateText } from "../lib/i18n-core.mjs";
import { StarIcon } from "@heroicons/react/24/solid";
import { useAccountText } from "../lib/account-interface";
import { useEffect, useState } from "react";
import { getCachedSession } from "../lib/session-client";
import { loadSearchIndex } from "../lib/search-index-client";
import {
  fetchLibrary,
  unsaveSkill,
  writeLibraryCache,
} from "../lib/library-client";
type Entry = {
  pathSlug: string;
  slug: string;
  sourceLabel?: string;
  description?: string;
  kind: string;
};
export function SavedSkills({
  dictionary,
}: {
  dictionary?: Record<string, string>;
}) {
  const chinese = dictionary !== undefined;
  return (
    <UiLocaleContext.Provider value={{ chinese, dictionary: dictionary ?? {} }}>
      <SavedSkillsContent chinese={chinese} />
    </UiLocaleContext.Provider>
  );
}

function SavedSkillsContent({ chinese }: { chinese: boolean }) {
  const t = useAccountText();
  const prefix = chinese ? "" : "/en";
  const [skills, setSkills] = useState<Entry[]>([]);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setPhase("loading");
    setError("");
    (async () => {
      const { data } = await getCachedSession();
      if (!active) return;
      if (!data?.user) {
        setPhase("signed-out");
        return;
      }
      const [result, catalog, descriptions] = await Promise.all([
        fetchLibrary(),
        loadSearchIndex<Entry>(),
        chinese ? loadTranslations().catch(() => null) : null,
      ]);
      const byPath = new Map(
        catalog.filter((s) => s.kind === "skill").map((s) => [s.pathSlug, s]),
      );
      if (active) {
        setSkills(
          result.library.savedSkillPaths.flatMap((path) => {
            const skill = byPath.get(path);
            if (!skill) return [];
            if (!chinese || !skill.description) return [skill];
            return [
              {
                ...skill,
                description: descriptions
                  ? translateText(skill.description, descriptions)
                  : undefined,
              },
            ];
          }),
        );
        setPhase("ready");
      }
    })().catch(() => {
      if (active) {
        setError("Unable to load favorites. Please try again.");
        setPhase("error");
      }
    });
    return () => {
      active = false;
    };
  }, [chinese, retry]);
  async function remove(path: string) {
    setPending(path);
    setError("");
    try {
      const result = await unsaveSkill(path);
      writeLibraryCache(result.library);
      setSkills((current) =>
        current.filter((s) =>
          result.library.savedSkillPaths.includes(s.pathSlug),
        ),
      );
    } catch {
      setError("Unable to update favorites. Please try again.");
    } finally {
      setPending(null);
    }
  }
  return (
    <div className="flex flex-col gap-4">
      {phase === "loading" && (
        <p role="status" className="type-body-md text-content-secondary">
          {t("Loading favorites\u2026")}
        </p>
      )}
      {phase === "signed-out" && (
        <div className="flex flex-col items-start gap-3">
          <p className="type-body-md text-content-secondary">
            {t("Sign in to view your favorites.")}
          </p>
          <a
            href={`${prefix}/login/?returnTo=${prefix}/library/`}
            className="type-body-md bg-fill-inverse text-content-inverse rounded-lg px-3 py-2"
          >
            {t("Continue with GitHub")}
          </a>
        </div>
      )}
      {phase === "ready" && skills.length === 0 && (
        <div className="flex flex-col items-start gap-3">
          <p className="type-body-md text-content-secondary">
            {t("Star a skill to save it here.")}
          </p>
          <a className="type-body-md underline" href={`${prefix}/skills`}>
            {t("Browse skills")}
          </a>
        </div>
      )}
      {skills.map((skill) => (
        <div
          key={skill.pathSlug}
          className="border-line-default flex min-w-0 items-center gap-3 border-b py-4"
        >
          <a
            className="min-w-0 flex-1"
            href={`${prefix}/skills/${skill.pathSlug}`}
          >
            <div className="type-body-md text-content-primary">
              {skill.slug}{" "}
              <span className="text-content-muted">{skill.sourceLabel}</span>
            </div>
            {skill.description && (
              <p className="type-body-sm text-content-secondary line-clamp-2">
                {skill.description}
              </p>
            )}
          </a>
          <button
            type="button"
            disabled={pending !== null}
            aria-label={t("Remove from favorites")}
            title={t("Remove from favorites")}
            aria-pressed={true}
            aria-busy={pending === skill.pathSlug}
            onClick={() => remove(skill.pathSlug)}
            className="hover:bg-fill-subtle focus-visible:outline-content-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-yellow-500 focus-visible:outline-1 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            <StarIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      {error && (
        <div role="alert" className="type-body-md text-content-secondary">
          <p>{t(error)}</p>
          {phase === "error" && (
            <button
              className="px-2 py-2 underline"
              onClick={() => setRetry((value) => value + 1)}
            >
              {t("Retry")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
