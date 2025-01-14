import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface ProjectProgressProps {
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  totalTasks,
  completedTasks,
  progress
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Project Progress</h3>
      
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-medium text-gray-900">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Task Statistics */}
        <div className="flex justify-between items-start">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {completedTasks}
            </div>
            <div className="text-sm text-gray-600">Completed Tasks</div>
          </div>

          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {totalTasks - completedTasks}
            </div>
            <div className="text-sm text-gray-600">Remaining Tasks</div>
          </div>
        </div>

        {/* Completion Status */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Tasks Completed</span>
            <span className="font-medium text-gray-900">
              {completedTasks} of {totalTasks}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {progress === 100 ? (
              <span className="text-green-600 font-medium">
                Project completed! 🎉
              </span>
            ) : (
              <span>
                {totalTasks - completedTasks} tasks remaining to complete
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;