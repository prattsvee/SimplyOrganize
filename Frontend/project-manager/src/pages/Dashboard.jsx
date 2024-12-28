import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import api from "../services/api"; // Use the API instance
import "./Dashboard.css";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/Project");
        setProjects(response.data); // Assuming response is an array of projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <Header />
        <div className="projects">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.name}
              lead={project.description} // Adjust field names based on your API
              progress={project.progress || 0} // Add progress field in API if needed
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
