// src/components/Column.tsx
import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task } from '../types';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  filterTasks: (tasks: Task[]) => Task[];
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks, filterTasks }) => (
  <div className="flex-shrink-0 w-80 bg-gray-50 rounded-lg shadow-sm">
    <div className="p-3 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-sm text-gray-500">{filterTasks(tasks).length}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1 hover:bg-gray-200 rounded">
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded">
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
    <div className="p-2">
      {filterTasks(tasks).map(task => (
        <TaskCard key={task.id} {...task} />
      ))}
    </div>
  </div>
);

export default Column;
