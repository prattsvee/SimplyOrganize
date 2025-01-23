import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// ProjectDetails.tsx
import taskService from "../services/taskServices";  // Fixed import
import TaskCard from "../components/TaskCard/TaskCard";
import {getTasksByProjectId} from "../services/taskServices";
import { TaskItem } from "../models/task";
import "./ProjectDetails.css";

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (projectId) {
          const data = await getTasksByProjectId(parseInt(projectId));
          setTasks(data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="project-details">
      <h1>Project {projectId} Details</h1>
      <div className="tasks">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
