export type UserRole = "ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Legacy compat: some code may check this */
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
