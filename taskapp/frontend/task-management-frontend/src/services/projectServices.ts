import api from "./api";
import { Project } from "../models/project";

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/api/Project");
  return response.data;
};
