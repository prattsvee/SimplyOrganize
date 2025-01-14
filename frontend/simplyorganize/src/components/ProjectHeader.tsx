import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Settings, 
  MoreVertical,
  Star
} from 'lucide-react';
import { ProjectDetails } from '../types/project';
import { formatDistanceToNow } from 'date-fns';

interface ProjectHeaderProps {
  project: ProjectDetails;
  onEditProject?: () => void;
  onProjectSettings?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project,
  onEditProject,
  onProjectSettings 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b">
      <div className="px-8 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <span className="px-2.5 py-0.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {project.projectKey}
              </span>
              <button className="text-gray-400 hover:text-yellow-500">
                <Star className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4 max-w-2xl">
              {project.shortDescription}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{project.teamMembers.length} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDistanceToNow(new Date(project.createdAt))} ago</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  project.status === 'Active' ? 'bg-green-500' :
                  project.status === 'OnHold' ? 'bg-yellow-500' :
                  project.status === 'Completed' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <span>{project.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map(member => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                  title={member.userName}
                >
                  <span className="text-sm font-medium text-blue-600">
                    {member.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
              {project.teamMembers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    +{project.teamMembers.length - 3}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onEditProject && (
                <button
                  onClick={onEditProject}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Project
                </button>
              )}

              {onProjectSettings && (
                <button
                  onClick={onProjectSettings}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}

              <button className="p-2 text-gray-400 hover:text-gray-500">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;