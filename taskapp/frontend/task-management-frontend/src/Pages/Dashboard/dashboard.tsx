import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { getProjects } from "../../services/projectServices";
import { Project } from "../../models/Project";

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.heading}>All Projects</h1>
      <div className={styles.projectList}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
