import React from "react";
import styles from "./TaskCard.module.css";
import { TaskItem } from "../../models/task";

interface TaskCardProps {
  task: TaskItem;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className={styles.taskCard}>
      <div className={styles.taskTitle}>{task.title}</div>
      <div className={styles.taskDetails}>
        <span className={styles.priority}>{task.status}</span>
        <span className={styles.dueDate}>Due: {task.description}</span>
      </div>
    </div>
  );
};

export default TaskCard;
