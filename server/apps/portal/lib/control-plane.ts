const base = "/api/control-plane";
export function csrf(): string | undefined {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("pcp_csrf="))
    ?.slice("pcp_csrf=".length);
}
export async function controlPlane(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.method && !["GET", "HEAD"].includes(init.method)) {
    const token = csrf();
    if (token) headers.set("x-csrf-token", token);
  }
  return fetch(`${base}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });
}
