import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TaskItem } from "../models/task";
import api from "../services/api";
import "./TaskDetails.css";

const TaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (taskId) {
          const response = await api.get(`/api/Task/${taskId}`);
          setTask(response.data);
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading) {
    return <div className="loading">Loading task details...</div>;
  }

  if (!task) {
    return <div className="error">Task not found!</div>;
  }

  return (
    <div className="task-details">
      <h1>{task.title}</h1>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <p><strong>Assignee:</strong> {task.assignee || "Unassigned"}</p>
    </div>
  );
};

export default TaskDetails;
