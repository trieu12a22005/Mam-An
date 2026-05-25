export type UserRole = "USER" | "FARMER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
