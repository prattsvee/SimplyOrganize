import React from "react";
import styles from "./Column.module.css";
import { TaskItem } from "../../models/task";
import TaskCard from "../TaskCard/TaskCard";

interface ColumnProps {
  title: string;
  tasks: TaskItem[];
}

const Column: React.FC<ColumnProps> = ({ title, tasks }) => {
  return (
    <div className={styles.column}>
      <h3 className={styles.columnTitle}>{title}</h3>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default Column;
