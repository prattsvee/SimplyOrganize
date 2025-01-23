import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Plus, Search, Filter } from 'lucide-react';
import KanbanColumn from '../components/KanbanColumn';
import NewTaskModal from '../components/NewTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { taskService } from '../services/taskServices';
import { TaskItem, TaskStatus, CreateTaskDto, UpdateTaskDto, TaskComment } from '../types/tasks';
import LoadingSpinner from '../components/LoadingSpinner';
import { signalRService } from '../services/SignalRService';

const COLUMN_TITLES: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: 'Backlog',
  [TaskStatus.ToDo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Review]: 'Review',
  [TaskStatus.Testing]: 'Testing',
  [TaskStatus.Done]: 'Done'
};

const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  useEffect(() => {
    const setupSignalR = async () => {
      await signalRService.start();
      
      signalRService.addTaskCreatedListener((task) => {
        if (task.projectId === Number(projectId)) {
          setTasks(prev => [...prev, task]);
        }
      });

      signalRService.addTaskUpdatedListener((updatedTask) => {
        if (updatedTask.projectId === Number(projectId)) {
          setTasks(prev => prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          ));
        }
      });

      signalRService.addTaskDeletedListener((taskId) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      });
    };

    setupSignalR();
    fetchTasks();

    return () => {
      signalRService.stop();
    };
  }, [projectId]);

 // Continuing KanbanBoard.tsx
 const fetchTasks = async () => {
  if (!projectId) return;
  
  try {
    setIsLoading(true);
    setError(null);
    const fetchedTasks = await taskService.getTasksByProjectId(parseInt(projectId));
    setTasks(fetchedTasks);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch tasks';
    setError(errorMessage);
    console.error('Error fetching tasks:', error);
  } finally {
    setIsLoading(false);
  }
};

const handleCreateTask = async (taskData: CreateTaskDto) => {
  if (!projectId) return;
  
  try {
    const newTask = await taskService.createTask({
      ...taskData,
      projectId: parseInt(projectId),
    });
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setShowNewTaskModal(false);
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

const handleUpdateTask = async (taskId: number, updatedData: UpdateTaskDto) => {
  try {
    const updatedTask = await taskService.updateTask(taskId, updatedData);
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    );
    setSelectedTask(null);
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
};

const handleDragEnd = async (result: DropResult) => {
  if (!result.destination) return;

  const { draggableId, destination } = result;
  const taskId = parseInt(draggableId);
  const newStatus = destination.droppableId as TaskStatus;
  
  // Optimistically update UI
  setTasks(prevTasks => 
    prevTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    )
  );
  
  try {
    await taskService.updateTaskStatus(taskId, newStatus);
  } catch (error) {
    console.error('Failed to update task status:', error);
    // Revert changes on error
    fetchTasks();
  }
};

const handleAddComment = async (taskId: number, content: string): Promise<TaskComment> => {
  try {
    const newComment = await taskService.addComment(taskId, content);
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [...task.comments, newComment]
          };
        }
        return task;
      })
    );
    return newComment;
  } catch (error) {
    console.error('Failed to add comment:', error);
    throw error;
  }
};

const handleDeleteComment = async (taskId: number, commentId: number) => {
  try {
    await taskService.deleteComment(taskId, commentId);
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: task.comments.filter(comment => comment.id !== commentId)
          };
        }
        return task;
      })
    );
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
};

const filterTasks = (status: TaskStatus): TaskItem[] => {
  return tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = 
      filterPriority === 'all' || 
      task.priority.toLowerCase() === filterPriority.toLowerCase();
    
    const matchesAssignee = 
      filterAssignee === 'all' || 
      task.assigneeId === filterAssignee;

    return task.status === status && 
           matchesSearch && 
           matchesPriority && 
           matchesAssignee;
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
  <div className="p-6">
    {/* Header Controls */}
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
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {/* Add dynamic assignee options based on project members */}
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
                onTaskClick={(task) => setSelectedTask(task)}
              />
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>

    {/* Modals */}
    {showNewTaskModal && (
      <NewTaskModal
        projectId={parseInt(projectId!)}
        onClose={() => setShowNewTaskModal(false)}
        onSubmit={handleCreateTask}
      />
    )}

    {selectedTask && (
      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    )}
  </div>
);
};

export default KanbanBoard;