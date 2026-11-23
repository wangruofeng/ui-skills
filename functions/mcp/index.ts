import { handleMcpRequest } from "../../src/lib/mcp-server";

export const onRequest = ({
  request,
  env,
}: {
  request: Request;
  env: { ASSETS: { fetch(request: Request): Promise<Response> } };
}) => handleMcpRequest(request, env.ASSETS);
