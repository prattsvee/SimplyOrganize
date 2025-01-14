// src/services/projectService.ts
import axios from 'axios';
import { 
  ProjectSummary, 
  ProjectDetails, 
  CreateProjectDto, 
  UpdateProjectDto, 
  TasksSummary 
} from '../types/project';

const API_URL = 'http://localhost:5059/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Error handler middleware
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Request was made and server responded with non-2xx status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      throw new Error('Network error - please check your connection');
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
      throw error;
    }
  }
);

export const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<ProjectSummary[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get project by ID
  getProjectById: async (id: number): Promise<ProjectDetails> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (project: CreateProjectDto): Promise<ProjectDetails> => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  // Update project
  updateProject: async (id: number, project: UpdateProjectDto): Promise<ProjectDetails> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  // Get project tasks summary
  getTasksSummary: async (projectId: number): Promise<TasksSummary> => {
    const response = await api.get(`/projects/${projectId}/tasks/summary`);
    return response.data;
  },

  // Add team member
  addTeamMember: async (projectId: number, userId: string): Promise<void> => {
    await api.post(`/projects/${projectId}/members`, JSON.stringify(userId), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // Remove team member
  removeTeamMember: async (projectId: number, userId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  }
};

export default projectService;