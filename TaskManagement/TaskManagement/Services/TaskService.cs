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
using TaskManagement.Helpers;

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
                var tasks = await _context.TaskItems
                    .Where(t => t.ProjectId == projectId)
                    .Select(t => new TaskDetailsDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        ShortDescription = t.ShortDescription,
                        LongDescription = t.LongDescription,
                        Status = t.Status.ToString(),
                        Priority = t.Priority.ToString(),
                        Type = t.Type.ToString(),
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt,
                        DueDate = t.DueDate,
                        AssigneeId = t.AssigneeId,
                        EstimatedHours = t.EstimatedHours,
                        LoggedHours = t.LoggedHours,
                        RemainingHours = t.RemainingHours,
                        ProjectId = t.ProjectId,
                        Labels = t.Labels, 
                        Comments = t.Comments.Select(c => new TaskCommentDto
                        {
                            Id = c.Id,
                            Content = c.Content,
                            AuthorId = c.AuthorId,
                            CreatedAt = c.CreatedAt
                        }).ToList(),
                        Attachments = t.Attachments.Select(a => new TaskAttachmentDto
                        {
                            Id = a.Id,
                            FileName = a.FileName,
                            ContentType = a.ContentType,
                            FileSize = a.FileSize,
                            UploadedAt = a.UploadedAt
                        }).ToList()
                    })
                    .ToListAsync();

                return tasks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tasks for project {ProjectId}: {Message}", projectId, ex.Message);
                throw;
            }
        }
        public async Task<TaskDetailsDto?> GetTaskByIdAsync(int id)
        {
            var task = await _context.TaskItems
                .Include(t => t.Comments)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == id);

            return task == null ? null : ModelMapper.ToTaskDetailsDto(task);
        }

        public async Task<TaskDetailsDto> CreateTaskAsync(CreateTaskDto taskDto, string creatorId)
        {
            var task = new TaskItem
            {
                Title = taskDto.Title,
                ShortDescription = taskDto.ShortDescription,
                LongDescription = taskDto.LongDescription,
                Status = TaskItemStatus.ToDo,
                Priority = Enum.Parse<TaskPriority>(taskDto.Priority),
                Type = Enum.Parse<TaskType>(taskDto.Type),
                AssigneeId = taskDto.AssigneeId,
                ReporterId = creatorId,
                EstimatedHours = taskDto.EstimatedHours,
                ProjectId = taskDto.ProjectId,
                CreatedAt = DateTime.UtcNow,
                Labels = taskDto.Labels ?? Array.Empty<string>()  // Just direct assignment now
            };

            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();

            var createdTask = ModelMapper.ToTaskDetailsDto(task);
            await _hubContext.Clients.All.SendAsync("TaskCreated", createdTask);

            return createdTask;
        }

        public async Task<TaskDetailsDto> UpdateTaskAsync(int id, UpdateTaskDto taskDto)
        {
            var task = await GetTaskOrThrowAsync(id);

            if (taskDto.Title != null)
                task.Title = taskDto.Title;
            if (taskDto.ShortDescription != null)
                task.ShortDescription = taskDto.ShortDescription;
            if (taskDto.LongDescription != null)
                task.LongDescription = taskDto.LongDescription;
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
                task.Labels = taskDto.Labels.ToArray();
            if (taskDto.DueDate.HasValue)
                task.DueDate = taskDto.DueDate;

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedTask = ModelMapper.ToTaskDetailsDto(task);
            await _hubContext.Clients.All.SendAsync("TaskUpdated", updatedTask);

            return updatedTask;
        }

        public async Task<bool> UpdateTaskStatusAsync(int id, TaskItemStatus status)
        {
            var task = await GetTaskOrThrowAsync(id);
            task.Status = status;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("TaskStatusUpdated", new { TaskId = id, Status = status.ToString() });

            return true;
        }

        public async Task<TaskCommentDto> AddCommentAsync(int taskId, string content, string userId)
        {
            var task = await GetTaskOrThrowAsync(taskId);

            var comment = new TaskComment
            {
                Content = content,
                AuthorId = userId,
                TaskItemId = taskId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var commentDto = ModelMapper.ToTaskCommentDto(comment);
            await _hubContext.Clients.All.SendAsync("TaskCommentAdded", commentDto);

            return commentDto;
        }

        public async Task<TaskAttachmentDto> AddAttachmentAsync(
            int taskId,
            string fileName,
            string filePath,
            string contentType,
            long fileSize,
            string userId)
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

            var attachmentDto = ModelMapper.ToTaskAttachmentDto(attachment);
            await _hubContext.Clients.All.SendAsync("TaskAttachmentAdded", attachmentDto);

            return attachmentDto;
        }

        public async Task DeleteTaskAsync(int id)
        {
            var task = await GetTaskOrThrowAsync(id);
            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("TaskDeleted", id);
        }

        public async Task<bool> DeleteCommentAsync(int taskId, int commentId)
        {
            var comment = await _context.TaskComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.TaskItemId == taskId);

            if (comment == null) return false;

            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("TaskCommentDeleted", new { TaskId = taskId, CommentId = commentId });
            return true;
        }

        public async Task<bool> DeleteAttachmentAsync(int taskId, int attachmentId)
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

        private async Task ValidateTaskProjectAsync(int taskId, int projectId)
        {
            var belongs = await _context.TaskItems
                .AnyAsync(t => t.Id == taskId && t.ProjectId == projectId);

            if (!belongs)
            {
                throw new InvalidOperationException("Task does not belong to the specified project");
            }
        }
    }
}