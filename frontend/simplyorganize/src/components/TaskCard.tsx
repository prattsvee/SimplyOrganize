import React from 'react';
import { TaskItem } from '../types/project';
import { AlertCircle, Bug, CheckCircle, ClipboardList, Clock, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: TaskItem;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getTypeIcon = () => {
    switch (task.type) {
      case 'Bug':
        return <Bug className="w-4 h-4 text-red-600" />;
      case 'Story':
        return <ClipboardList className="w-4 h-4 text-blue-600" />;
      case 'Epic':
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all border border-gray-200 hover:border-blue-200"
    >
      <div className="flex items-start gap-3 mb-3">
        {getTypeIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
            {task.title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">#{task.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor()}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      {task.shortDescription && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.shortDescription}
        </p>
      )}

      <div className="space-y-2">
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments?.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
            {task.assigneeId && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {task.assigneeName?.[0] || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;