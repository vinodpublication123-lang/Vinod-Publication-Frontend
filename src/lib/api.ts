/**
 * Global API configuration.
 * All backend requests must use API_BASE_URL as the root.
 * Set NEXT_PUBLIC_API_URL in .env.local to override (e.g. in production).
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Convenience helper — builds a full URL for a given path.
 * Usage: apiUrl("/api/v1/auth/login")
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
