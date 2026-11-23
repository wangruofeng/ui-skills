import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { registry } from "../src/data/registry.ts";
import {
  defaultSkillContentLoader,
  prefetchPrerenderSkills,
} from "../src/lib/agent-skills-discovery.ts";

describe("skill prerender prefetch", () => {
  test("prefetches unique skill sources concurrently and reuses their content", async () => {
    const entries = Array.from({ length: 5 }, (_, index) => ({
      ...registry[0]!,
      user: "prefetch-test",
      rawUrl: `https://example.com/prefetch-${index}`,
    }));
    let active = 0;
    let peak = 0;
    let calls = 0;
    await prefetchPrerenderSkills([...entries, entries[0]!], async (entry) => {
      calls++;
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return `# ${entry.rawUrl}`;
    }, 2);

    assert.equal(calls, entries.length);
    assert.equal(peak, 2);
    assert.equal(await defaultSkillContentLoader(entries[0]!), `# ${entries[0]!.rawUrl}`);
  });

  test("does not cache failed prerender fetches", async () => {
    const entry = {
      ...registry[0]!,
      user: "prefetch-test",
      rawUrl: "https://example.com/prefetch-failure",
    };
    await prefetchPrerenderSkills([entry], async () => {
      throw new Error("temporary failure");
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response("# recovered")) as typeof fetch;
    try {
      assert.equal(await defaultSkillContentLoader(entry), "# recovered");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
