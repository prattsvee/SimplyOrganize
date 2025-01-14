import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { ProjectDetails, TasksSummary } from '../types/project';
import { projectService } from '../services/projectServices';
import { signalRService } from '../services/SignalRService';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamMembersList from '../components/TeamMembersList';
import ProjectStats from '../components/ProjectStats';

const ProjectBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [tasksSummary, setTasksSummary] = useState<TasksSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!projectId) return;

        const [projectData, summaryData] = await Promise.all([
          projectService.getProjectById(parseInt(projectId)),
          projectService.getTasksSummary(parseInt(projectId))
        ]);

        setProject(projectData);
        setTasksSummary(summaryData);

        // Set up real-time updates
        signalRService.addProjectUpdatedListener((updatedProject) => {
          if (updatedProject.id === parseInt(projectId)) {
            setProject(updatedProject);
          }
        });

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();

    return () => {
      // Cleanup SignalR listeners
      signalRService.removeListener('ProjectUpdated', () => {});
    };
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onTabChange={() => {}} />
        
        {/* Project Header */}
        <div className="border-b bg-white">
          <div className="px-8 py-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h1>
                <p className="text-gray-600 mb-4">{project.shortDescription}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {project.teamMembers.length} members
                  </span>
                  <span className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Project
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Project Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {/* Project Stats */}
          {tasksSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Tasks"
                value={tasksSummary.totalTasks}
                icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
                className="bg-blue-50"
              />
              <StatCard
                title="Completed"
                value={tasksSummary.completedTasks}
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                className="bg-green-50"
              />
              <StatCard
                title="In Progress"
                value={tasksSummary.inProgressTasks}
                icon={<Clock className="w-5 h-5 text-yellow-600" />}
                className="bg-yellow-50"
              />
              <StatCard
                title="Overdue"
                value={tasksSummary.overdueTasks}
                icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                className="bg-red-50"
              />
              <StatCard
                title="Upcoming"
                value={tasksSummary.upcomingTasks}
                icon={<CalendarDays className="w-5 h-5 text-purple-600" />}
                className="bg-purple-50"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Project Overview</h2>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-900">{project.longDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Project Key</h3>
                        <p className="mt-1 text-gray-900">{project.projectKey}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="mt-1 text-gray-900">{project.status}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Project Type</h3>
                        <p className="mt-1 text-gray-900">{project.type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                        <div className="mt-1">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Add Member
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  {project.teamMembers.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {member.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.userName}</p>
                          <p className="text-sm text-gray-500">{member.userEmail}</p>
                        </div>
                      </div>
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className = '' }) => (
  <div className={`p-6 rounded-lg ${className}`}>
    <div className="flex items-center">
      {icon}
      <h3 className="ml-2 text-sm font-medium text-gray-900">{title}</h3>
    </div>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default ProjectBoard;