import { registry, type RegistrySkill } from "../data/registry";

/** Discovery-safe name derived from the catalog pathSlug (CLI-compatible identity). */
export function toDiscoveryName(pathSlug: string): string {
  return pathSlug
    .toLowerCase()
    .replaceAll("/", "-")
    .replaceAll(/[^a-z0-9-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 64);
}

/** Artifact path shared with the CLI (`ui-skills get` fetches the same URL). */
export function skillArtifactPath(pathSlug: string): string {
  return `/skills/${pathSlug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}/llms.txt`;
}

export function getRegistrySkillByDiscoveryName(
  name: string,
): RegistrySkill | undefined {
  const normalized = name.trim().toLowerCase();
  return registry.find(
    (entry) =>
      toDiscoveryName(entry.pathSlug) === normalized ||
      entry.slug === normalized ||
      entry.pathSlug === normalized ||
      entry.pathSlug.endsWith(`/${normalized}`),
  );
}
