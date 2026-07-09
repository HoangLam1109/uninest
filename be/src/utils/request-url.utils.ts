import type { Request } from "express";

function getForwardedHeaderValue(value: string | undefined) {
  return value?.split(",")[0]?.trim();
}

export function getRequestOrigin(req: Request) {
  const protocol =
    getForwardedHeaderValue(req.get("x-forwarded-proto")) ?? req.protocol;
  const host = getForwardedHeaderValue(req.get("x-forwarded-host")) ?? req.get("host");

  return host ? `${protocol}://${host}` : "";
}

export function buildPublicPathUrl(req: Request, publicPath: string) {
  const origin = getRequestOrigin(req);
  const normalizedPath = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;

  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}
