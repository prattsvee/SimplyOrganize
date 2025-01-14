import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ title, lead, progress }) => {
  return (
    <div className="project-card">
      <h3>{title}</h3>
      <p>Lead: {lead}</p>
      <p>Progress: {progress}%</p>
      <button>View Details</button>
    </div>
  );
};

export default ProjectCard;
