// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { TaskItem, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskComment } from '../types/tasks';

// API URLs
const API_URLS = {
  tasks: 'http://localhost:5059/api',
  auth: 'http://localhost:5114/api/auth'
};

const TOKEN_KEY = 'auth_token';

// Create axios instance with error handling and auth
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Request interceptor for adding token
  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response) {
        console.error('Server Error:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });

        // Handle 401 Unauthorized
        if (error.response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/login';
        }
      } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', error.message);
      } else {
        // Other errors
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create instances for each service
export const taskApi = createApiInstance(API_URLS.tasks);
export const authApi = createApiInstance(API_URLS.auth);

// Auth API service
export const AuthApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await authApi.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await authApi.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await authApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetData: {
    email: string;
    token: string;
    newPassword: string;
  }) => {
    const response = await authApi.post('/auth/reset-password', resetData);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await authApi.post('/auth/verify-email', { token });
    return response.data;
  },

  validateToken: async () => {
    try {
      const response = await authApi.post('/auth/validate-token');
      return response.data;
    } catch (error) {
      return false;
    }
  }
};

// Task API service
export const TasksApi = {
  getByProjectId: async (projectId: number): Promise<TaskItem[]> => {
    const response = await taskApi.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  getTasksByProjectId: async (projectId: number): Promise<TaskItem[]> => {
    const response = await taskApi.get<TaskItem[]>(`/tasks/project/${projectId}`);
    return response.data;
  },

    getTaskById: async (taskId: number): Promise<TaskItem> => {
    const response = await taskApi.get<TaskItem>(`/tasks/${taskId}`);
    return response.data;
  },

  

  create: async (taskData: CreateTaskDto): Promise<TaskItem> => {
    const response = await taskApi.post('/tasks', taskData);
    return response.data;
  },

  update: async (taskId: number, updateData: UpdateTaskDto): Promise<TaskItem> => {
    const response = await taskApi.put(`/tasks/${taskId}`, updateData);
    return response.data;
  },

  updateStatus: async (taskId: number, status: TaskStatus): Promise<void> => {
    await taskApi.put(`/tasks/${taskId}/status`, { status });
  },

  addComment: async (taskId: number, content: string): Promise<TaskComment> => {
    const response = await taskApi.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  delete: async (taskId: number): Promise<void> => {
    await taskApi.delete(`/tasks/${taskId}`);
  }
};

// Project API service
export const ProjectsApi = {
  getAll: async () => {
    const response = await taskApi.get('/projects');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await taskApi.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData: any) => {
    const response = await taskApi.post('/projects', projectData);
    return response.data;
  },

  update: async (id: number, projectData: any) => {
    const response = await taskApi.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id: number) => {
    await taskApi.delete(`/projects/${id}`);
  }
};

// Error Handler Types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error);
}

export default {
  task: taskApi,
  auth: authApi,
  TasksApi,
  ProjectsApi,
  AuthApi
};