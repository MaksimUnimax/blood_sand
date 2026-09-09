import { NextRequest } from "next/server";
import {
  allowedRoute,
  controlPlaneOrigin,
} from "../../../../lib/control-plane-route";

const requestHeaders = ["content-type", "cookie", "x-csrf-token"];
const responseHeaders = [
  "content-type",
  "cache-control",
  "pragma",
  "retry-after",
];

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const pathname = `/${path.join("/")}`;
  const target = controlPlaneOrigin();
  if (
    !target ||
    !allowedRoute(request.method, pathname) ||
    request.nextUrl.pathname.includes("%2f") ||
    request.nextUrl.pathname.includes("%2F") ||
    request.nextUrl.pathname.includes("%5c") ||
    request.nextUrl.pathname.includes("%5C")
  ) {
    return Response.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid request" } },
      { status: 404 },
    );
  }
  const headers = new Headers();
  for (const name of requestHeaders) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  try {
    const upstream = await fetch(
      `${target}${pathname}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : await request.arrayBuffer(),
        cache: "no-store",
      },
    );
    const output = new Headers();
    for (const name of responseHeaders) {
      const value = upstream.headers.get(name);
      if (value !== null) output.set(name, value);
    }
    for (const cookie of upstream.headers.getSetCookie())
      output.append("set-cookie", cookie);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: output,
    });
  } catch {
    return Response.json(
      {
        error: { code: "SERVICE_UNAVAILABLE", message: "Service unavailable" },
      },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
