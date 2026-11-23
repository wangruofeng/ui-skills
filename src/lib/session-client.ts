import { authClient } from "./auth-client";

export const accountSessionKey = "ui-skills:account-session";
const cacheDurationMs = 10 * 60 * 1000;

export type AccountUser = {
  email: string;
  image: string | null;
  initial: string;
};

type AccountSession = { user: AccountUser; expiresAt: number };
type SessionCache = { data: AccountSession | null; refreshAt: number };
type SessionResult = {
  data: AccountSession | null;
  error?: Awaited<ReturnType<typeof authClient.getSession>>["error"];
};

let cache: SessionCache | undefined;
let pending: Promise<SessionResult> | undefined;

function readCache(): SessionCache | undefined {
  if (cache) return cache;
  try {
    return (
      JSON.parse(sessionStorage.getItem(accountSessionKey) ?? "null") ??
      undefined
    );
  } catch {
    return undefined;
  }
}

function writeCache(data: AccountSession | null) {
  cache = {
    data,
    refreshAt: Math.min(
      Date.now() + cacheDurationMs,
      data?.expiresAt ?? Infinity,
    ),
  };
  try {
    sessionStorage.setItem(accountSessionKey, JSON.stringify(cache));
  } catch {
    // The in-memory cache still deduplicates reads in this document.
  }
}

export function clearCachedSession() {
  cache = undefined;
  pending = undefined;
  try {
    sessionStorage.removeItem(accountSessionKey);
  } catch {
    // Storage may be blocked.
  }
}

export function cacheSignedOutSession() {
  pending = undefined;
  writeCache(null);
}

export function getCachedSession(): Promise<SessionResult> {
  const cached = readCache();
  if (cached && cached.refreshAt > Date.now()) {
    return Promise.resolve({ data: cached.data });
  }
  if (!pending) {
    const request = authClient
      .getSession()
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const session = data
          ? {
              user: {
                email: data.user.email,
                image: data.user.image ?? null,
                initial:
                  (data.user.name || data.user.email)
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "?",
              },
              expiresAt: new Date(data.session.expiresAt).getTime(),
            }
          : null;
        // A request started before sign-in or sign-out must not repopulate the cache.
        if (pending === request) writeCache(session);
        return { data: session };
      })
      .finally(() => {
        if (pending === request) pending = undefined;
      });
    pending = request;
  }
  return pending;
}
