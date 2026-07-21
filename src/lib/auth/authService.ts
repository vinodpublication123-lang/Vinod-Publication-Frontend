import { TokenStorage } from "./token";
import { User } from "./types";
import { apiUrl } from "@/lib/api";

// Builds a full URL for auth endpoints against the global backend base URL.
const AUTH = (path: string) => apiUrl(`/api/v1/auth${path}`);

/**
 * Backend returns { user, accessToken, refreshToken }
 * We normalise to a common shape used throughout the frontend.
 */
export interface AuthResult {
  token: string;
  user: User;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({ message: "Request failed" }));
  if (!res.ok) {
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  // Backend wraps everything in { success, data }
  return (body.data ?? body) as T;
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResult> {
    const response = await fetch(AUTH("/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await parseResponse<{
      user: User;
      accessToken: string;
      refreshToken?: string;
    }>(response);

    // Persist refresh token if backend sends it
    if (data.refreshToken) {
      TokenStorage.setRefreshToken(data.refreshToken);
    }

    return { token: data.accessToken, user: data.user };
  },

  async register(input: { name: string; email: string; password: string; phone?: string }): Promise<AuthResult> {
    const response = await fetch(AUTH("/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await parseResponse<{
      user: User;
      accessToken: string;
      refreshToken?: string;
    }>(response);

    if (data.refreshToken) {
      TokenStorage.setRefreshToken(data.refreshToken);
    }

    return { token: data.accessToken, user: data.user };
  },

  async getMe(): Promise<{ user: User }> {
    const token = TokenStorage.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(AUTH("/me"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const user = await parseResponse<User>(response);
    return { user };
  },

  /**
   * Exchange the stored refresh token for a new access token.
   * Returns the new access token on success, or null if the refresh token is
   * missing / invalid (caller should treat this as a logout signal).
   */
  async refresh(): Promise<string | null> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(AUTH("/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh token is invalid / revoked — clear everything
        TokenStorage.clearToken();
        TokenStorage.clearRefreshToken();
        return null;
      }

      const data = await parseResponse<{
        accessToken: string;
        refreshToken?: string;
      }>(response);

      TokenStorage.setToken(data.accessToken);
      if (data.refreshToken) {
        TokenStorage.setRefreshToken(data.refreshToken);
      }

      return data.accessToken;
    } catch {
      TokenStorage.clearToken();
      TokenStorage.clearRefreshToken();
      return null;
    }
  },

  logout() {
    TokenStorage.clearToken();
    TokenStorage.clearRefreshToken();
  },
};
