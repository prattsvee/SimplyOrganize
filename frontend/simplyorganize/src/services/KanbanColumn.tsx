// src/components/KanbanColumn.tsx
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { MoreHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    tasks: any[];
    wip?: number;
  };
  provided: any;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, provided }) => {
  return (
    <div
      className="kanban-column"
      ref={provided.innerRef}
      {...provided.droppableProps}
    >
      <div className="column-header">
        <div className="column-title-group">
          <h2 className="column-title">{column.title}</h2>
          <span className="task-count">
            {column.tasks.length} {column.wip ? `/ ${column.wip}` : ''}
          </span>
        </div>
        <button className="column-menu-button">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="task-list">
        {column.tasks.map((task, index) => (
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
                className={`task-card-wrapper ${
                  snapshot.isDragging ? 'is-dragging' : ''
                }`}
              >
                <TaskCard
                  id={task.id}
                  title={task.title}
                  type={task.type}
                  priority={task.priority}
                  assignee={task.assignee}
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