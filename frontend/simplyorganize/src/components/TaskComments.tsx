import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { TaskComment } from '../types/tasks';

interface TaskCommentsProps {
  comments: TaskComment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
  currentUserId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!onDeleteComment) return;
    
    try {
      await onDeleteComment(commentId);
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium">Comments</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {comments.map((comment) => (
          <div 
            key={comment.id}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium text-gray-900">
                  {comment.authorId === currentUserId ? 'You' : comment.authorId}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              {comment.authorId === currentUserId && onDeleteComment && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-start gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 min-h-[80px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;