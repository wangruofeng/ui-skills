import {
  getRegistrySkillByDiscoveryName,
  skillArtifactPath,
  toDiscoveryName,
} from "./skill-discovery-paths";
import { getSiteOrigin } from "./agent-discovery";
import { registry } from "../data/registry";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
};

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const protocolVersions = ["2025-11-25", "2025-06-18", "2025-03-26"] as const;
const allowedMethods = { Allow: "GET, POST, OPTIONS" };

const MAX_REQUEST_BYTES = 64 * 1024;

function jsonRpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id: id ?? null, result }),
    { headers: responseHeaders },
  );
}

function jsonRpcError(
  id: JsonRpcRequest["id"] | null,
  code: number,
  message: string,
  status = 200,
) {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code, message },
    }),
    { status, headers: responseHeaders },
  );
}

const tools = [
  {
    name: "list_skills",
    description:
      "List skills from the UI Skills registry (same catalog as ui-skills list).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Optional filter over pathSlug, name, or description.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_skill",
    description:
      "Fetch skill markdown by discovery name, slug, or pathSlug (same content as ui-skills get).",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Discovery name, slug, or pathSlug (for example baseline-ui or ibelick/baseline-ui).",
        },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
];

export async function handleMcpRequest(
  request: Request,
  assets: { fetch(request: Request): Promise<Response> },
) {
  const requestOrigin = new URL(request.url).origin;
  const origin = getSiteOrigin();
  const callerOrigin = request.headers.get("Origin");
  if (callerOrigin !== null && callerOrigin !== requestOrigin) {
    return jsonRpcError(null, -32600, "Invalid Origin", 403);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { ...responseHeaders, ...allowedMethods },
    });
  }

  const version = request.headers.get("MCP-Protocol-Version");
  if (
    version !== null &&
    !protocolVersions.some((supported) => supported === version)
  ) {
    return jsonRpcError(null, -32600, "Unsupported MCP protocol version", 400);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
    return jsonRpcError(null, -32600, "Request body is too large", 413);
  }
  let body: JsonRpcRequest | null = null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = parsed as JsonRpcRequest;
    }
  } catch {
    return jsonRpcError(null, -32700, "Parse error", 400);
  }
  if (
    !body ||
    body.jsonrpc !== "2.0" ||
    typeof body.method !== "string" ||
    ("id" in body && typeof body.id !== "string" && typeof body.id !== "number")
  ) {
    return jsonRpcError(null, -32600, "Invalid Request", 400);
  }

  if (!("id" in body)) {
    return new Response(null, { status: 202, headers: responseHeaders });
  }

  switch (body.method) {
    case "initialize":
      return jsonRpcResult(body.id, {
        protocolVersion:
          protocolVersions.find(
            (version) => version === body.params?.protocolVersion,
          ) ?? protocolVersions[0],
        capabilities: { tools: {} },
        serverInfo: { name: "UI Skills", version: "0.2.4" },
      });
    case "ping":
      return jsonRpcResult(body.id, {});
    case "tools/list":
      return jsonRpcResult(body.id, { tools });
    case "tools/call": {
      const name =
        typeof body.params?.name === "string" ? body.params.name : "";
      const args =
        body.params?.arguments && typeof body.params.arguments === "object"
          ? (body.params.arguments as Record<string, unknown>)
          : {};

      if (name === "list_skills") {
        const query =
          typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
        const skills = registry
          .filter((entry) => {
            if (!query) return true;
            const haystack =
              `${entry.slug} ${entry.pathSlug} ${entry.name} ${entry.description}`.toLowerCase();
            return haystack.includes(query);
          })
          .map((entry) => ({
            name: toDiscoveryName(entry.pathSlug),
            pathSlug: entry.pathSlug,
            description: entry.description,
            url: `${origin}${skillArtifactPath(entry.pathSlug)}`,
          }));

        return jsonRpcResult(body.id, {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  source: `${origin}/skills/registry.json`,
                  count: skills.length,
                  skills,
                },
                null,
                2,
              ),
            },
          ],
        });
      }

      if (name === "get_skill") {
        const skillName = typeof args.name === "string" ? args.name : "";
        const entry = getRegistrySkillByDiscoveryName(skillName);
        if (!entry) {
          return jsonRpcResult(body.id, {
            isError: true,
            content: [
              {
                type: "text",
                text: `Unknown skill "${skillName}". Use list_skills or ui-skills list.`,
              },
            ],
          });
        }

        try {
          const artifact = await assets.fetch(
            new Request(
              new URL(skillArtifactPath(entry.pathSlug), requestOrigin),
            ),
          );
          const content = await artifact.text();
          // Static builds retain the body of a failed prerendered artifact.
          if (
            !artifact.ok ||
            !artifact.headers.get("Content-Type")?.startsWith("text/plain") ||
            content === "Skill source unavailable"
          ) {
            throw new Error("Skill artifact unavailable");
          }
          return jsonRpcResult(body.id, {
            content: [{ type: "text", text: content }],
          });
        } catch {
          return jsonRpcResult(body.id, {
            isError: true,
            content: [
              {
                type: "text",
                text: `Failed to fetch skill content for ${entry.pathSlug}`,
              },
            ],
          });
        }
      }

      return jsonRpcError(body.id, -32601, `Unknown tool: ${name}`);
    }
    default:
      return jsonRpcError(body.id, -32601, `Method not found: ${body.method}`);
  }
}
