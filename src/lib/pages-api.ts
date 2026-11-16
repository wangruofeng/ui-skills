import type { AuthEnv } from "./auth-config";
import { getAuth, getPageSession } from "./auth";
import { getAuthConfig } from "./auth-config";
import { setPrivateAuthHeaders } from "./auth-response";
import { createLibraryStore } from "./library-store";
import { handleLibraryRequest } from "./library-http";

export async function handleApiRequest(
  request: Request,
  env: AuthEnv,
): Promise<Response> {
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  let response: Response;
  try {
    const auth = getAuth(env);
    if (path === "/api/auth/status" && request.method === "GET") {
      response = Response.json({
        github: Boolean(getAuthConfig(env)?.socialProviders.github),
      });
    } else if (path === "/api/auth" || path.startsWith("/api/auth/")) {
      response = auth
        ? await auth.handler(request)
        : path === "/api/auth/get-session" && request.method === "GET"
          ? Response.json(null)
          : Response.json(
              { error: "Sign-in is not configured yet." },
              { status: 503 },
            );
    } else if (path === "/api/library" || path.startsWith("/api/library/")) {
      if (!auth || !env.AUTH_DB)
        response = Response.json(
          { error: "Sign-in is not configured yet." },
          { status: 503 },
        );
      else {
        const cookies = new Headers();
        const session = await getPageSession(auth, request.headers, cookies);
        response = await handleLibraryRequest(
          request,
          session?.user.id ?? null,
          createLibraryStore(env.AUTH_DB),
        );
        for (const cookie of cookies.getSetCookie())
          response.headers.append("Set-Cookie", cookie);
      }
    } else response = Response.json({ error: "Not found." }, { status: 404 });
  } catch {
    console.error(JSON.stringify({ component: "account-api", level: "error" }));
    response = Response.json(
      { error: "That request could not be completed." },
      { status: 500 },
    );
  }
  const headers = new Headers(response.headers);
  setPrivateAuthHeaders(headers);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(response.body, { status: response.status, headers });
}
