import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MoreHorizontal, Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { TaskItem } from '../types/project';

interface KanbanColumnProps {
  title: string;
  tasks: TaskItem[];
  provided: any;
  onTaskClick: (task: TaskItem) => void;
  limit?: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  provided,
  onTaskClick,
  limit
}) => {
  const isAtLimit = limit ? tasks.length >= limit : false;

  return (
    <div
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg"
      ref={provided.innerRef}
      {...provided.droppableProps}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <span className={`px-2 py-1 text-sm rounded-full ${
              isAtLimit ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
            }`}>
              {tasks.length}{limit ? `/${limit}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2 space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {tasks.map((task, index) => (
          <Draggable
            key={task.id}
            draggableId={task.id.toString()}
            index={index}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  ...provided.draggableProps.style,
                  opacity: snapshot.isDragging ? 0.8 : 1
                }}
              >
                <TaskCard
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
};

export default KanbanColumn;