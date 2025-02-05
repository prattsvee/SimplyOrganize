// src/types/tasks.ts
// Export the enums first
export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum TaskStatus {
  Backlog = 'Backlog',
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Review = 'Review',
  Testing = 'Testing',
  Done = 'Done'
}

export enum TaskType {
  Task = 'Task',
  Bug = 'Bug',
  Story = 'Story',
  Epic = 'Epic'
}

// Then interfaces
export interface TaskComment {
  id: number;
  content: string;
  authorId: string;
  createdAt: string;
  taskItemId: number;
}

export interface TaskItem {
  id: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate: string | null;
  assigneeId: string | null;
  estimatedHours: number;
  projectId: number;
  labels: string[];
  comments: TaskComment[];
  attachments: TaskAttachment[];  // Added this
  createdAt: string;
  updatedAt?: string;
}

export interface TaskAttachment {
  id: number;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedById: string;
}

export interface CreateTaskDto {
  title: string;
  shortDescription: string;
  longDescription: string;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: string | null;
  assigneeId?: string | null;
  estimatedHours: number;
  projectId: number;
  labels: string[];
}


export interface UpdateTaskDto {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  dueDate?: string | null;
  assigneeId?: string | null;
  estimatedHours?: number;
  labels?: string[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'milestone';
  status?: string;
  priority?: string;
  assignee?: string;
}