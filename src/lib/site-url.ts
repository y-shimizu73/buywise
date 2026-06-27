/**
 * Resolve the public site URL.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (explicit, recommended for production)
 * 2. Vercel-provided domains (so OAuth still works if the env var is missing)
 * 3. localhost for local development
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    return `https://${stripTrailingSlash(vercelProductionUrl)}`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${stripTrailingSlash(vercelUrl)}`;
  }

  return "http://localhost:3000";
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
