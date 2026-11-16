import type { APIRoute } from "astro";
import { getSiteOrigin } from "../../../lib/agent-discovery";
import {
  buildMcpServerCard,
  discoveryJsonHeaders,
} from "../../../lib/agent-skills-discovery";

export const GET: APIRoute = ({ site }) =>
  new Response(JSON.stringify(buildMcpServerCard(getSiteOrigin(site))), {
    headers: discoveryJsonHeaders,
  });
