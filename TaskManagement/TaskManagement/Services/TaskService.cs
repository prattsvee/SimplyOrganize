using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TaskManagement.Models;
using TaskManagement.DTOs;
using TaskManagement.Data;
using TaskManagement.Hubs;

namespace TaskManagement.Services
{
    public class TaskService : ITaskService
    {
        private readonly TaskManagementDbContext _context;
        private readonly IHubContext<TaskHub> _hubContext;
        private readonly ILogger<TaskService> _logger;

        public TaskService(
            TaskManagementDbContext context,
            IHubContext<TaskHub> hubContext,
            ILogger<TaskService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<TaskDetailsDto>> GetTasksByProjectIdAsync(int projectId)
        {
            try
            {
                _logger.LogInformation("Fetching tasks for project {ProjectId}", projectId);

                var tasks = await _context.TaskItems
                    .Where(t => t.ProjectId == projectId)
                    .Include(t => t.Comments)
                    .Include(t => t.Attachments)
                    .Select(t => MapToTaskDetailsDto(t))
                    .ToListAsync();

                return tasks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tasks for project {ProjectId}", projectId);
                throw;
            }
        }

        public async Task<TaskDetailsDto?> GetTaskByIdAsync(int id)
        {
            try
            {
                var task = await _context.TaskItems
                    .Include(t => t.Comments)
                    .Include(t => t.Attachments)
                    .FirstOrDefaultAsync(t => t.Id == id);

                return task == null ? null : MapToTaskDetailsDto(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching task {TaskId}", id);
                throw;
            }
        }

        public async Task<TaskDetailsDto> CreateTaskAsync(CreateTaskDto createTaskDto, string creatorId)
        {
            try
            {
                // Validate project exists
                var projectExists = await _context.Projects
                    .AnyAsync(p => p.Id == createTaskDto.ProjectId);

                if (!projectExists)
                {
                    throw new KeyNotFoundException($"Project {createTaskDto.ProjectId} not found");
                }

                var task = new TaskItem
                {
                    Title = createTaskDto.Title.Trim(),
                    ShortDescription = createTaskDto.ShortDescription.Trim(),
                    LongDescription = createTaskDto.LongDescription.Trim(),
                    Status = TaskItemStatus.ToDo,
                    Priority = Enum.Parse<TaskPriority>(createTaskDto.Priority),
                    Type = Enum.Parse<TaskType>(createTaskDto.Type),
                    AssigneeId = createTaskDto.AssigneeId,
                    ReporterId = creatorId,
                    EstimatedHours = createTaskDto.EstimatedHours,
                    ProjectId = createTaskDto.ProjectId,
                    CreatedAt = DateTime.UtcNow,
                    Labels = createTaskDto.Labels ?? Array.Empty<string>()
                };

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.TaskItems.Add(task);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    var resultDto = MapToTaskDetailsDto(task);
                    await _hubContext.Clients.All.SendAsync("TaskCreated", resultDto);
                    return resultDto;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<TaskDetailsDto> UpdateTaskAsync(int id, UpdateTaskDto taskDto)
        {
            var task = await GetTaskOrThrowAsync(id);

            try
            {
                if (taskDto.Title != null)
                    task.Title = taskDto.Title.Trim();
                if (taskDto.ShortDescription != null)
                    task.ShortDescription = taskDto.ShortDescription.Trim();
                if (taskDto.LongDescription != null)
                    task.LongDescription = taskDto.LongDescription.Trim();
                if (taskDto.Status != null)
                    task.Status = Enum.Parse<TaskItemStatus>(taskDto.Status);
                if (taskDto.Priority != null)
                    task.Priority = Enum.Parse<TaskPriority>(taskDto.Priority);
                if (taskDto.Type != null)
                    task.Type = Enum.Parse<TaskType>(taskDto.Type);
                if (taskDto.AssigneeId != null)
                    task.AssigneeId = taskDto.AssigneeId;
                if (taskDto.EstimatedHours.HasValue)
                    task.EstimatedHours = taskDto.EstimatedHours.Value;
                if (taskDto.Labels != null)
                    task.Labels = taskDto.Labels;
                if (taskDto.DueDate.HasValue)
                    task.DueDate = taskDto.DueDate;

                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedTaskDto = MapToTaskDetailsDto(task);
                await _hubContext.Clients.All.SendAsync("TaskUpdated", updatedTaskDto);

                return updatedTaskDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateTaskStatusAsync(int id, TaskItemStatus status)
        {
            try
            {
                var task = await GetTaskOrThrowAsync(id);
                task.Status = status;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("TaskStatusUpdated", new { TaskId = id, Status = status.ToString() });

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for task {TaskId}", id);
                throw;
            }
        }

        public async Task<TaskCommentDto> AddCommentAsync(int taskId, string content, string userId)
        {
            try
            {
                var task = await GetTaskOrThrowAsync(taskId);

                var comment = new TaskComment
                {
                    Content = content.Trim(),
                    AuthorId = userId,
                    TaskItemId = taskId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TaskComments.Add(comment);
                await _context.SaveChangesAsync();

                var commentDto = new TaskCommentDto
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    AuthorId = comment.AuthorId,
                    CreatedAt = comment.CreatedAt
                };

                await _hubContext.Clients.All.SendAsync("TaskCommentAdded", commentDto);

                return commentDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment to task {TaskId}", taskId);
                throw;
            }
        }

        public async Task<TaskAttachmentDto> AddAttachmentAsync(
            int taskId,
            string fileName,
            string filePath,
            string contentType,
            long fileSize,
            string userId)
        {
            try
            {
                var task = await GetTaskOrThrowAsync(taskId);

                var attachment = new TaskAttachment
                {
                    FileName = fileName,
                    FilePath = filePath,
                    ContentType = contentType,
                    FileSize = fileSize,
                    UploadedById = userId,
                    TaskItemId = taskId,
                    UploadedAt = DateTime.UtcNow
                };

                _context.TaskAttachments.Add(attachment);
                await _context.SaveChangesAsync();

                var attachmentDto = new TaskAttachmentDto
                {
                    Id = attachment.Id,
                    FileName = attachment.FileName,
                    ContentType = attachment.ContentType,
                    FileSize = attachment.FileSize,
                    UploadedAt = attachment.UploadedAt
                };

                await _hubContext.Clients.All.SendAsync("TaskAttachmentAdded", attachmentDto);

                return attachmentDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding attachment to task {TaskId}", taskId);
                throw;
            }
        }

        public async Task DeleteTaskAsync(int id)
        {
            try
            {
                var task = await GetTaskOrThrowAsync(id);
                _context.TaskItems.Remove(task);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("TaskDeleted", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteCommentAsync(int taskId, int commentId)
        {
            try
            {
                var comment = await _context.TaskComments
                    .FirstOrDefaultAsync(c => c.Id == commentId && c.TaskItemId == taskId);

                if (comment == null) return false;

                _context.TaskComments.Remove(comment);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("TaskCommentDeleted", new { TaskId = taskId, CommentId = commentId });
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {CommentId} from task {TaskId}", commentId, taskId);
                throw;
            }
        }

        public async Task<bool> DeleteAttachmentAsync(int taskId, int attachmentId)
        {
            try
            {
                var attachment = await _context.TaskAttachments
                    .FirstOrDefaultAsync(a => a.Id == attachmentId && a.TaskItemId == taskId);

                if (attachment == null) return false;

                try
                {
                    if (File.Exists(attachment.FilePath))
                    {
                        File.Delete(attachment.FilePath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting file for attachment {AttachmentId}", attachmentId);
                }

                _context.TaskAttachments.Remove(attachment);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("TaskAttachmentDeleted", new { TaskId = taskId, AttachmentId = attachmentId });
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting attachment {AttachmentId} from task {TaskId}", attachmentId, taskId);
                throw;
            }
        }

        private async Task<TaskItem> GetTaskOrThrowAsync(int taskId)
        {
            var task = await _context.TaskItems
                .Include(t => t.Comments)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                throw new KeyNotFoundException($"Task {taskId} not found");
            }

            return task;
        }

        private static TaskDetailsDto MapToTaskDetailsDto(TaskItem task)
        {
            return new TaskDetailsDto
            {
                Id = task.Id,
                Title = task.Title,
                ShortDescription = task.ShortDescription,
                LongDescription = task.LongDescription,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                Type = task.Type.ToString(),
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                DueDate = task.DueDate,
                AssigneeId = task.AssigneeId,
                EstimatedHours = task.EstimatedHours,
                LoggedHours = task.LoggedHours,
                RemainingHours = task.RemainingHours,
                ProjectId = task.ProjectId,
                Labels = task.Labels,
                Comments = task.Comments.Select(c => new TaskCommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    AuthorId = c.AuthorId,
                    CreatedAt = c.CreatedAt
                }).ToList(),
                Attachments = task.Attachments.Select(a => new TaskAttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    ContentType = a.ContentType,
                    FileSize = a.FileSize,
                    UploadedAt = a.UploadedAt
                }).ToList()
            };
        }
    }
}