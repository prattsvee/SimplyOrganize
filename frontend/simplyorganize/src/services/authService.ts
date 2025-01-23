// src/services/authService.ts
import { AuthApi } from './api';
import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    throw {
      message: axiosError.response?.data?.message || 'An error occurred',
      statusCode: axiosError.response?.status || 500
    };
  }
  throw { message: 'An unexpected error occurred', statusCode: 500 };
};

const authService = {
  initializeAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    if (token && user) {
      try {
        JSON.parse(user);
        return true;
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    return false;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await AuthApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await AuthApi.register(userData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await AuthApi.forgotPassword(email);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  resetPassword: async (resetData: ResetPasswordData): Promise<void> => {
    try {
      await AuthApi.resetPassword(resetData);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return !!(token && user);
  },

  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;