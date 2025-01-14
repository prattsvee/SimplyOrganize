import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import { projectService } from "../services/projectServices";
import NewProjectModal from '../components/NewProjectModal';
import { ProjectSummary, CreateProjectDto } from "../types/project";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData: CreateProjectDto) => {
    try {
      await projectService.createProject(projectData);
      await fetchProjects(); // Refresh the projects list after creation
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onTabChange={(tab) => console.log(`Selected Tab: ${tab}`)} />
        <main className="p-8 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-xl relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                size={20} 
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchProjects}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No projects match your search' : 'No projects found'}
              </p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  projectKey={project.projectKey}
                  shortDescription={project.shortDescription}
                  status={project.status}
                  progress={project.progress}
                  leadName={project.leadName}
                  teamMemberCount={project.teamMemberCount}
                  lastUpdated={project.lastUpdated}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};

export default HomePage;