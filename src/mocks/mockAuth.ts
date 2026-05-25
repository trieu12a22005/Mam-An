import { User, AuthResponse } from '../types/auth.type';

export const mockUser: User = {
  id: 'usr_1',
  email: 'user@example.com',
  fullName: 'Garden User',
  role: 'USER',
};

export const mockAuthResponse: AuthResponse = {
  user: mockUser,
  accessToken: 'mock_access_token',
  refreshToken: 'mock_refresh_token',
};
