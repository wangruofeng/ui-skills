import type { AuthEnv } from "../../src/lib/auth-config";
import { handleApiRequest } from "../../src/lib/pages-api";

export const onRequest = ({
  request,
  env,
}: {
  request: Request;
  env: AuthEnv;
}) => handleApiRequest(request, env);
