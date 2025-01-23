// src/services/taskService.ts
import { taskApi } from './api';
import { TaskItem, TaskStatus, CreateTaskDto, UpdateTaskDto, TaskComment } from '../types/tasks';
import authService from './authService';

// Helper to ensure all requests have auth headers
const getConfig = () => ({
  headers: {
    ...authService.getAuthHeader()
  }
});

// Error handler
const handleError = (error: any, operation: string) => {
  console.error(`Task service error during ${operation}:`, error);
  if (error.response?.status === 401) {
    authService.logout(); // Redirect to login if unauthorized
    throw new Error('Authentication required');
  }
  throw error;
};

export const taskService = {
  getTasksByProjectId: async (projectId: number): Promise<TaskItem[]> => {
    try {
      const response = await taskApi.get<TaskItem[]>(
        `/tasks/project/${projectId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return handleError(error, 'getTasksByProjectId');
    }
  },

  getTaskById: async (taskId: number): Promise<TaskItem> => {
    try {
      const response = await taskApi.get<TaskItem>(
        `/tasks/${taskId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return handleError(error, 'getTaskById');
    }
  },

  createTask: async (taskData: CreateTaskDto): Promise<TaskItem> => {
    try {
      const formattedTask = {
        title: taskData.title,
        shortDescription: taskData.shortDescription,
        longDescription: taskData.longDescription,
        priority: "Medium", // Hardcode initially to test
        type: "Task",      // Hardcode initially to test
        projectId: 1,      // Use a known valid project ID
        estimatedHours: 0,
        dueDate: null,
        assigneeId: null,
        labels: []
      };

      console.log('Sending task data:', formattedTask);

      const response = await taskApi.post<TaskItem>(
        '/tasks', 
        formattedTask,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      // Log the complete error details
      console.error('Task creation error details:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  updateTask: async (taskId: number, updates: UpdateTaskDto): Promise<TaskItem> => {
    try {
      // Remove any undefined values to prevent overwriting with nulls
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      const response = await taskApi.put<TaskItem>(
        `/tasks/${taskId}`,
        cleanUpdates,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return handleError(error, 'updateTask');
    }
  },

  updateTaskStatus: async (taskId: number, status: TaskStatus): Promise<void> => {
    try {
      await taskApi.put(
        `/tasks/${taskId}/status`,
        { status, taskId },
        getConfig()
      );
    } catch (error) {
      handleError(error, 'updateTaskStatus');
    }
  },

  addComment: async (taskId: number, content: string): Promise<TaskComment> => {
    try {
      // Just send the string content as required by API
      const response = await taskApi.post<TaskComment>(
        `/tasks/${taskId}/comments`,
        JSON.stringify(content),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Comment creation error:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: number): Promise<void> => {
    try {
      await taskApi.delete(
        `/tasks/${taskId}`,
        getConfig()
      );
    } catch (error) {
      handleError(error, 'deleteTask');
    }
  },

  deleteComment: async (taskId: number, commentId: number): Promise<void> => {
    try {
      await taskApi.delete(
        `/tasks/${taskId}/comments/${commentId}`,
        getConfig()
      );
    } catch (error) {
      handleError(error, 'deleteComment');
    }
  },

  // Additional helper method for bulk operations
  updateMultipleTasks: async (tasks: { id: number, updates: UpdateTaskDto }[]): Promise<void> => {
    try {
      await Promise.all(
        tasks.map(({ id, updates }) => taskService.updateTask(id, updates))
      );
    } catch (error) {
      handleError(error, 'updateMultipleTasks');
    }
  }
};

export default taskService;