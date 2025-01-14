import api from './api';
import { TaskItem, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../types/tasks';

export const taskService = {
  getTasksByProjectId: async (projectId: number): Promise<TaskItem[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  getTaskById: async (taskId: number): Promise<TaskItem> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData: CreateTaskDto): Promise<TaskItem> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId: number, updates: UpdateTaskDto): Promise<TaskItem> => {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  updateTaskStatus: async (taskId: number, status: TaskStatus): Promise<void> => {
    await api.put(`/tasks/${taskId}/status`, status);
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  addComment: async (taskId: number, content: string): Promise<any> => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  deleteComment: async (taskId: number, commentId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  }
};

export default taskService;