import React from "react";
import styles from "./TaskBoard.module.css";
import { TaskItem } from "../../models/task";
import Column from "../Column/Column";

interface TaskBoardProps {
  tasks: TaskItem[];
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  const columns = ["To Do", "In Progress", "Done"];

  return (
    <div className={styles.board}>
      {columns.map((status) => (
        <Column
          key={status}
          title={status}
          tasks={tasks.filter((task) => task.status === status)}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
