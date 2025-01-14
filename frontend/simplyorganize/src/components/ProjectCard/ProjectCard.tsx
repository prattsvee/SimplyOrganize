import React from "react";
import styles from "../ProjectCard/ProjectCard.css";
import { Project } from "../../models/Project";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className={styles.projectCard}>
      <h3 className={styles.projectName}>{project.name}</h3>
      <p className={styles.projectDescription}>{project.description}</p>
      <p className={styles.projectLead}>Lead: {project.taskItems[0]?.project || "N/A"}</p>
      <div className={styles.projectProgress}>
        Progress: {Math.min(project.taskItems.length * 10, 100)}%
      </div>
    </div>
  );
};

export default ProjectCard;
