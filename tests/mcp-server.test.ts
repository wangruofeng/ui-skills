import assert from "node:assert/strict";
import { test } from "node:test";
import { onRequest } from "../functions/mcp/index";

const origin = "https://ui-skills.wangruofeng007.com";
const endpoint = origin + "/mcp";
const markdown = "---\nname: baseline-ui\n---\n# Baseline UI";
const assets = {
  fetch: async (request: Request) => {
    assert.equal(
      new URL(request.url).pathname,
      "/skills/ibelick/baseline-ui/llms.txt",
    );
    return new Response(markdown);
  },
};

function send(method: string, params?: unknown) {
  return onRequest({
    request: new Request(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
        "MCP-Protocol-Version": "2025-11-25",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: method.startsWith("notifications/") ? undefined : 1,
        method,
        params,
      }),
    }),
    env: { ASSETS: assets },
  });
}

test("initializes a stateless MCP client and serves the documented tools", async () => {
  const initialized = await send("initialize", {
    protocolVersion: "2025-11-25",
  });
  assert.equal(initialized.status, 200);
  assert.equal((await initialized.json()).result.protocolVersion, "2025-11-25");
  assert.equal((await send("notifications/initialized")).status, 202);

  const { result } = await (await send("tools/list")).json();
  assert.deepEqual(
    result.tools.map((tool: { name: string }) => tool.name),
    ["list_skills", "get_skill"],
  );

  const listed = await (
    await send("tools/call", {
      name: "list_skills",
      arguments: { query: "ibelick/baseline-ui" },
    })
  ).json();
  const catalog = JSON.parse(listed.result.content[0].text);
  assert.equal(catalog.count, 1);
  assert.equal(
    catalog.skills[0].url,
    origin + "/skills/ibelick/baseline-ui/llms.txt",
  );

  for (const name of [
    "ibelick-baseline-ui",
    "baseline-ui",
    "ibelick/baseline-ui",
  ]) {
    const skill = await (
      await send("tools/call", {
        name: "get_skill",
        arguments: { name },
      })
    ).json();
    assert.deepEqual(skill.result.content, [{ type: "text", text: markdown }]);
  }
});

test("declines SSE and rejects cross-origin or unsupported protocol requests", async () => {
  for (const [request, status] of [
    [new Request(endpoint, { headers: { Accept: "text/event-stream" } }), 405],
    [
      new Request(endpoint, { headers: { Origin: "https://invalid.example" } }),
      403,
    ],
    [
      new Request(endpoint, {
        method: "POST",
        headers: { "MCP-Protocol-Version": "invalid" },
      }),
      400,
    ],
  ] as const) {
    assert.equal(
      (await onRequest({ request, env: { ASSETS: assets } })).status,
      status,
    );
  }
});
