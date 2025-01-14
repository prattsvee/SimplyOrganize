using TaskManagement.Models;
using TaskManagement.DTOs;

namespace TaskManagement.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDetailsDto>> GetTasksByProjectIdAsync(int projectId);
        Task<TaskDetailsDto?> GetTaskByIdAsync(int id);
        Task<TaskDetailsDto> CreateTaskAsync(CreateTaskDto taskDto, string creatorId);
        Task<TaskDetailsDto> UpdateTaskAsync(int id, UpdateTaskDto taskDto);
        Task<bool> UpdateTaskStatusAsync(int id, TaskItemStatus status);
        Task<TaskCommentDto> AddCommentAsync(int taskId, string content, string userId);
        Task<TaskAttachmentDto> AddAttachmentAsync(int taskId, string fileName, string filePath, string contentType, long fileSize, string userId);
        Task DeleteTaskAsync(int id);
        Task<bool> DeleteCommentAsync(int taskId, int commentId);
        Task<bool> DeleteAttachmentAsync(int taskId, int attachmentId);
    }
}