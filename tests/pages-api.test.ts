import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { getPlatformProxy } from "wrangler";
import type { AuthEnv } from "../src/lib/auth-config.ts";
import { getAuth } from "../src/lib/auth.ts";
import { handleApiRequest } from "../src/lib/pages-api.ts";

test("Pages account API persists favorites, isolates users and rejects cross-origin mutations", async () => {
  const platform = await getPlatformProxy<AuthEnv>({
    configPath: "tests/fixtures/auth.wrangler.jsonc",
    persist: false,
    remoteBindings: false,
    envFiles: [],
  });
  try {
    const db = platform.env.AUTH_DB!;
    for (const name of ["0001_auth.sql", "0002_library.sql"]) {
      const sql = await readFile(
        new URL(`../migrations/${name}`, import.meta.url),
        "utf8",
      );
      await db.batch(
        sql
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => db.prepare(s)),
      );
    }
    const env: AuthEnv = {
      AUTH_DB: db,
      BETTER_AUTH_URL: "http://localhost:4321",
      BETTER_AUTH_SECRET: "test-only-pages-account-secret-over-32-characters",
      GITHUB_CLIENT_ID: "test-only-client",
      GITHUB_CLIENT_SECRET: "test-only-secret",
    };
    const configured = getAuth(env)!;
    const auth = betterAuth({ ...configured.options, plugins: [testUtils()] });
    const context = await auth.$context;
    const a = await context.test.saveUser(
      context.test.createUser({ email: "pages-a@example.com" }),
    );
    const b = await context.test.saveUser(
      context.test.createUser({ email: "pages-b@example.com" }),
    );
    const loginA = await context.test.login({ userId: a.id });
    const loginB = await context.test.login({ userId: b.id });
    const request = (
      path: string,
      headers = new Headers(),
      method = "GET",
      body?: unknown,
    ) => {
      const h = new Headers(headers);
      if (body) {
        h.set("Content-Type", "application/json");
        if (!h.has("Origin")) h.set("Origin", "http://localhost:4321");
      }
      return handleApiRequest(
        new Request(`http://localhost:4321${path}`, {
          headers: h,
          method,
          body: body ? JSON.stringify(body) : undefined,
        }),
        env,
      );
    };
    const status = await request("/api/auth/status");
    assert.deepEqual(await status.json(), { github: true });
    assert.equal(status.headers.get("Cache-Control"), "private, no-store");
    assert.equal((await request("/api/library")).status, 401);
    const save = await request("/api/library/saved", loginA.headers, "POST", {
      skillPath: "ibelick/ui-skills-root",
    });
    assert.equal(save.status, 200);
    assert.deepEqual((await save.json()).library.savedSkillPaths, [
      "ibelick/ui-skills-root",
    ]);
    assert.deepEqual(
      (await (await request("/api/library", loginA.headers)).json()).library
        .savedSkillPaths,
      ["ibelick/ui-skills-root"],
    );
    assert.deepEqual(
      (await (await request("/api/library", loginB.headers)).json()).library
        .savedSkillPaths,
      [],
    );
    const foreign = new Headers(loginA.headers);
    foreign.set("Origin", "https://attacker.example");
    assert.equal(
      (
        await request("/api/library/saved", foreign, "DELETE", {
          skillPath: "ibelick/ui-skills-root",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("/api/library/saved", loginA.headers, "POST", {
          skillPath: "unknown/no-skill",
        })
      ).status,
      400,
    );
    const remove = await request(
      "/api/library/saved",
      loginA.headers,
      "DELETE",
      { skillPath: "ibelick/ui-skills-root" },
    );
    assert.equal(remove.status, 200);
    assert.deepEqual((await remove.json()).library.savedSkillPaths, []);
    assert.equal((await request("/api/unknown")).status, 404);
    const preview = await handleApiRequest(
      new Request("http://localhost:4321/api/auth/status"),
      {},
    );
    assert.deepEqual(await preview.json(), { github: false });
  } finally {
    await platform.dispose();
  }
});
