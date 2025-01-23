import React, { useState } from 'react';
import { X, Clock, User, Tag, AlertCircle, MessageSquare } from 'lucide-react';
import { TaskItem, UpdateTaskDto, TaskStatus, TaskComment } from '../types/tasks';
import TaskComments from './TaskComments';
import authService from '../services/authService';
import taskService from '../services/taskServices';
// Update the component props
interface TaskDetailsModalProps {
  task: TaskItem;
  onClose: () => void;
  onUpdate: (taskId: number, updates: UpdateTaskDto) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  onDeleteComment?: (taskId: number, commentId: number) => Promise<void>;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onUpdate,
  onAddComment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<TaskItem>(task);
  const [comment, setComment] = useState('');
  const currentUser = authService.getCurrentUser();

  const handleSave = async () => {
    try {
      const updates: UpdateTaskDto = {
        title: editedTask.title,
        shortDescription: editedTask.shortDescription,
        longDescription: editedTask.longDescription,
        status: editedTask.status,
        priority: editedTask.priority,
        type: editedTask.type,
        assigneeId: editedTask.assigneeId,
        dueDate: editedTask.dueDate,
        estimatedHours: editedTask.estimatedHours,
        labels: editedTask.labels
      };
      await onUpdate(task.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    
  
    try {
      // Send just the string content
      await onAddComment(task.id, comment.trim());
      setComment(''); // Clear input
      
      // Refresh task details to get new comment
      const updatedTask = await taskService.getTaskById(task.id);
      if (updatedTask) {
        onUpdate(task.id, updatedTask);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{`${task.type}-${task.id}`}</span>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                className="text-lg font-medium px-2 py-1 border rounded"
              />
            ) : (
              <h2 className="text-lg font-medium">{task.title}</h2>
            )}
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 p-6">
          <div className="col-span-2 space-y-6">
            {/* Description Section */}
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              {isEditing ? (
                <textarea
                  value={editedTask.longDescription}
                  onChange={(e) => setEditedTask({...editedTask, longDescription: e.target.value})}
                  className="w-full h-32 p-2 border rounded"
                />
              ) : (
                <p className="text-gray-600">{task.longDescription}</p>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Comments</h3>
              {task.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{comment.authorId}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
              <div className="flex gap-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 border rounded"
                  rows={3}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleCommentSubmit}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({...editedTask, status: e.target.value as TaskStatus})}
                  className="px-2 py-1 border rounded"
                  disabled={!isEditing}
                >
                  <option value="Backlog">Backlog</option>
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Testing">Testing</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Labels Section */}
            <div className="space-y-2">
              <h3 className="font-medium">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {editedTask.labels.map((label, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedTask(task);
                      setIsEditing(false);
                    }}
                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;