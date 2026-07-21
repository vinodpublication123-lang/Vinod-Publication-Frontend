const TOKEN_KEY = "vinverse_auth_token";
const REFRESH_KEY = "vinverse_refresh_token";

export const TokenStorage = {
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clearToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_KEY);
    }
    return null;
  },
  setRefreshToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_KEY, token);
    }
  },
  clearRefreshToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_KEY);
    }
  },
};
