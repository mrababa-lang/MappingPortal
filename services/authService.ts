import { api } from './api';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    // The backend returns { data: { token, user }, meta: ... }
    const response = await api.post<any>('/auth/login', { email, password });
    
    const responseBody = response.data;
    
    // Safely traverse the object structure
    const innerData = responseBody.data || {};
    const user = innerData.user || responseBody.user;
    const token = innerData.token || responseBody.token;

    if (!user) {
      console.error("Login failed: Invalid response structure", responseBody);
      throw new Error("User data missing from server response.");
    }

    // Ensure fullName exists (fallback for API discrepancies)
    if (!user.fullName && user.name) {
       user.fullName = user.name;
    }

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    
    return user;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};