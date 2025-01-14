import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Plus, Search, Filter } from 'lucide-react';
import KanbanColumn from '../components/KanbanColumn';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import NewTaskModal from '../components/NewTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { TasksApi } from '../services/api';
import { TaskItem, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../types/tasks';
import LoadingSpinner from '../components/LoadingSpinner';

const COLUMN_TITLES: Record<TaskStatus, string> = {
  'Backlog': 'Backlog',
  'ToDo': 'To Do',
  'InProgress': 'In Progress',
  'Review': 'Review',
  'Testing': 'Testing',
  'Done': 'Done'
};

const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await TasksApi.getByProjectId(parseInt(projectId));
      setTasks(fetchedTasks);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: CreateTaskDto) => {
    if (!projectId) return;
    
    try {
      const newTask = await TasksApi.create({
        ...taskData,
        projectId: parseInt(projectId),
      });
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: number, updatedData: UpdateTaskDto) => {
    try {
      const updatedTask = await TasksApi.update(taskId, updatedData);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
      setShowTaskDetailsModal(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };
  
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
  
    const { source, destination, draggableId } = result;
    
    try {
      // Optimistically update the UI
      const updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex(t => t.id.toString() === draggableId);
      if (taskIndex === -1) return;
  
      const task = updatedTasks[taskIndex];
      updatedTasks[taskIndex] = {
        ...task,
        status: destination.droppableId as TaskStatus
      };
  
      setTasks(updatedTasks);
  
      // Update in backend
      await TasksApi.updateStatus(
        parseInt(draggableId),
        destination.droppableId as TaskStatus
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert the changes if the API call fails
      fetchTasks();
    }
  };
  

  
  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  const filterTasks = (status: TaskStatus) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority.toLowerCase() === filterPriority.toLowerCase();
      return task.status === status && matchesSearch && matchesPriority;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onTabChange={() => {}} />
        
        <div className="p-6">
          {/* Control Panel */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </button>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {Object.entries(COLUMN_TITLES).map(([status, title]) => (
                <Droppable key={status} droppableId={status}>
                  {(provided) => (
                    <KanbanColumn
                      title={title}
                      tasks={filterTasks(status as TaskStatus)}
                      provided={provided}
                      onTaskClick={handleTaskClick}
                    />
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Modals */}
      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {showTaskDetailsModal && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => {
            setShowTaskDetailsModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;