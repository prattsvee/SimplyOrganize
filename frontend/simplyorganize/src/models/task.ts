export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: string;
  projectId: number;
  project: string;
  priority: string;
  assignee: string;
}
