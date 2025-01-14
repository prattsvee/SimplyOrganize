// src/types/project.ts

export type ProjectStatus = 'Active' | 'OnHold' | 'Completed' | 'Archived';
export type ProjectType = 'Software' | 'Business' | 'Marketing' | 'Operations';
export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'Review' | 'Testing' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskType = 'Task' | 'Bug' | 'Story' | 'Epic';

export interface ProjectMember {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: string;
  isActive: boolean;
}

export interface TaskComment {
  id: number;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface TaskItem {
  id: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours: number;
  labels: string[];
  projectId: number;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface ProjectSummary {
  id: number;
  name: string;
  projectKey: string;
  shortDescription: string;
  status: ProjectStatus;
  progress: number;
  leadName: string;
  teamMemberCount: number;
  lastUpdated: string;
}

export interface ProjectDetails {
  id: number;
  name: string;
  shortDescription: string;
  longDescription: string;
  projectKey: string;
  status: ProjectStatus;
  type: ProjectType;
  createdAt: string;
  updatedAt?: string;
  leadId: string;
  defaultAssigneeId?: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  teamMembers: ProjectMember[];
  tasks: TaskItem[];
}

export interface CreateProjectDto {
  name: string;
  shortDescription: string;
  longDescription: string;
  projectKey: string;
  type: ProjectType;
  leadId: string;
  defaultAssigneeId?: string;
}

export interface UpdateProjectDto {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  leadId?: string;
  defaultAssigneeId?: string;
}

export interface TasksSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
}