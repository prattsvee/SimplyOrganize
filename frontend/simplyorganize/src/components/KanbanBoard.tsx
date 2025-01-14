// src/components/KanbanBoard.tsx
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Column from './Column';
import NewTaskModal from './NewTaskModal';

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: 1, title: 'Design system documentation', priority: 'high', type: 'task', assignee: 'Alex K.' },
        { id: 2, title: 'User research interviews', priority: 'medium', type: 'story', assignee: 'Maria S.' },
      ]
    },
    {
      id: 'inProgress',
      title: 'In Progress',
      tasks: [
        { id: 3, title: 'Homepage redesign', priority: 'high', type: 'story', assignee: 'John D.' },
        { id: 4, title: 'Fix navigation bugs', priority: 'high', type: 'bug', assignee: 'Sarah M.' },
      ]
    },
    {
      id: 'review',
      title: 'Review',
      tasks: [
        { id: 5, title: 'Update color palette', priority: 'low', type: 'task', assignee: 'Mike R.' },
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: 6, title: 'Login page implementation', priority: 'medium', type: 'story', assignee: 'Lisa P.' },
      ]
    }
  ]);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'task',
    priority: 'medium',
    assignee: ''
  });

  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  };

  const handleCreateTask = () => {
    if (newTask.title.trim() === '') return;
    
    const updatedColumns = [...columns];
    const todoColumn = updatedColumns.find(col => col.id === 'todo');
    if (todoColumn) {
      todoColumn.tasks.unshift({
        id: Math.max(...columns.flatMap(col => col.tasks.map(task => task.id))) + 1,
        ...newTask
      });
      setColumns(updatedColumns);
      setNewTask({ title: '', type: 'task', priority: 'medium', assignee: '' });
      setShowNewTaskModal(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header with controls */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto min-h-[calc(100vh-12rem)]">
        {columns.map(column => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={column.tasks}
            filterTasks={filterTasks}
          />
        ))}
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        show={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        handleCreateTask={handleCreateTask}
      />
    </div>
  );
};

export default KanbanBoard;
