export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'Review' | 'Testing' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskType = 'Task' | 'Bug' | 'Story' | 'Epic';

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
    estimatedHours: number;
    projectId: number;
    labels: string[];
    comments: TaskComment[];
    attachments: TaskAttachment[];
}

export interface CreateTaskDto {
    title: string;
    shortDescription: string;
    longDescription: string;
    priority: string;
    type: string;
    dueDate?: string;
    assigneeId?: string;
    estimatedHours: number;
    projectId: number;
    labels: string[];
}

export interface UpdateTaskDto {
    title?: string;
    shortDescription?: string;
    longDescription?: string;
    priority?: string;
    type?: string;
    status?: string;
    dueDate?: string;
    assigneeId?: string;
    estimatedHours?: number;
    labels?: string[];
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