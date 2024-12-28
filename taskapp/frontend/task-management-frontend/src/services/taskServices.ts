import api from "./api";
import { Task } from "../models/task";

export const getTasksByProjectId = async (projectId: number): Promise<Task[]> => {
  const response = await api.get(`/api/Task/project/${projectId}`);
  return response.data;
};
