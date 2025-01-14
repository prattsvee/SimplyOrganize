import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Users, Clock, Star } from 'lucide-react';

// Keep the props interface aligned with your API response
export interface ProjectCardProps {
  id: number;          // Changed from string to number
  name: string;        // Changed from title
  projectKey: string;
  shortDescription?: string;
  status?: string;
  progress: number;
  leadName: string;    // Changed from lead
  teamMemberCount?: number;
  lastUpdated?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,               // Changed from title
  projectKey,
  shortDescription,
  status = 'Active',  // Default value
  progress,
  leadName,           // Changed from lead
  teamMemberCount = 0,
  lastUpdated
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="project-card hover:cursor-pointer"
      onClick={() => navigate(`/project/${id}/board`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-blue flex items-center justify-center text-white font-medium">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-neutral-900 font-medium">{name}</h3>
            <span className="text-sm text-neutral-500">{projectKey}</span>
          </div>
        </div>
        <button className="hover:text-yellow-500 text-neutral-500">
          <Star size={16} />
        </button>
      </div>

      {shortDescription && (
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
          {shortDescription}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-neutral-700">
            <Users size={16} />
            <span>{teamMemberCount} members</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <Layout size={16} />
            <span>Lead: {leadName}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-700">Progress</span>
            <span className="text-neutral-900 font-medium">{progress}%</span>
          </div>
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-success rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {lastUpdated && (
          <div className="text-xs text-neutral-500">
            <Clock size={14} className="inline mr-1" />
            Updated {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;