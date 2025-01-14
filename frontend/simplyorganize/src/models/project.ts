import { TaskItem } from "./task";

export interface Project {
  id: number;
  name: string;
  description: string;
  taskItems: TaskItem[];
}
