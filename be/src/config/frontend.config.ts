const LOCAL_FRONTEND_ORIGIN = "http://localhost:5173";
const DEPLOY_FRONTEND_ORIGIN = "https://uninest-one.vercel.app";

function normalizeOrigins(origins: Array<string | undefined>) {
  return Array.from(
    new Set(
      origins
        .map((origin) => origin?.trim())
        .filter((origin): origin is string => Boolean(origin)),
    ),
  );
}

export const defaultFrontendOrigin =
  process.env.FRONTEND_URL?.trim() || LOCAL_FRONTEND_ORIGIN;

export const allowedFrontendOrigins = normalizeOrigins([
  defaultFrontendOrigin,
  LOCAL_FRONTEND_ORIGIN,
  DEPLOY_FRONTEND_ORIGIN,
  ...(process.env.FRONTEND_URLS ?? "").split(","),
]);

export function isAllowedFrontendOrigin(origin: string | undefined | null) {
  if (!origin) {
    return false;
  }

  return allowedFrontendOrigins.includes(origin);
}

export function resolveFrontendOrigin(origin: string | undefined | null) {
  return isAllowedFrontendOrigin(origin) ? origin : defaultFrontendOrigin;
}

export function buildFrontendPaymentUrls(origin: string | undefined | null) {
  const frontendOrigin = resolveFrontendOrigin(origin);

  return {
    returnUrl: `${frontendOrigin}/payment/success`,
    cancelUrl: `${frontendOrigin}/payment/cancel`,
  };
}
