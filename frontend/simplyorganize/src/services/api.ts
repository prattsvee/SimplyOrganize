// src/services/api.ts
import axios from 'axios';
import { TaskItem, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../types/tasks';

const api = axios.create({
  baseURL: 'http://localhost:5059/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Server Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
);

// Tasks API
export const TasksApi = {
  getByProjectId: async (projectId: number): Promise<TaskItem[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  create: async (taskData: CreateTaskDto): Promise<TaskItem> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (taskId: number, updateData: UpdateTaskDto): Promise<TaskItem> => {
    const response = await api.put(`/tasks/${taskId}`, updateData);
    return response.data;
  },

  updateStatus: async (taskId: number, status: TaskStatus): Promise<void> => {
    await api.put(`/tasks/${taskId}/status`, status);
  },

  delete: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  }
};

// Projects API
export const ProjectsApi = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getTasks: async (projectId: number) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  }
};

export default api;