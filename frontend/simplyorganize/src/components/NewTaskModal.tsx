import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CreateTaskDto, TaskType, TaskPriority } from '../types/tasks';
import { ProjectMember } from '../types/project';
import { projectService } from '../services/projectServices';

interface NewTaskModalProps {
  projectId: number;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskDto) => Promise<void>;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: '',
    shortDescription: '',
    longDescription: '',
    type: TaskType.Task,
    priority: TaskPriority.Medium,
    projectId: projectId,
    estimatedHours: 0,
    dueDate: null,
    assigneeId: null,
    labels: []
  });

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLabel, setCurrentLabel] = useState('');

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        const projectDetails = await projectService.getProjectById(projectId);
        setProjectMembers(projectDetails.teamMembers);
      } catch (err) {
        console.error('Failed to fetch project members:', err);
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.shortDescription.trim()) {
      setError('Short description is required');
      return false;
    }
    if (formData.estimatedHours < 0) {
      setError('Estimated hours cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentLabel.trim()) {
      e.preventDefault();
      if (!formData.labels.includes(currentLabel.trim())) {
        setFormData(prev => ({
          ...prev,
          labels: [...prev.labels, currentLabel.trim()]
        }));
      }
      setCurrentLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={e => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description
              </label>
              <textarea
                value={formData.longDescription}
                onChange={e => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as TaskType }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(TaskType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(TaskPriority).map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={e => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={formData.assigneeId || ''}
                onChange={e => setFormData(prev => ({ ...prev, assigneeId: e.target.value || null }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {projectMembers.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.userName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
              <input
                type="text"
                value={currentLabel}
                onChange={e => setCurrentLabel(e.target.value)}
                onKeyDown={handleAddLabel}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type and press Enter to add labels"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.labels.map(label => (
                  <span
                    key={label}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;