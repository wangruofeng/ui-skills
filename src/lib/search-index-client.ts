import { loadPublicJson } from "./public-data.mjs";

export function loadSearchIndex<T>() {
  return loadPublicJson<T[]>(
    "/data/search-index.json",
    "searchIndexVersion",
    Array.isArray,
  );
}
