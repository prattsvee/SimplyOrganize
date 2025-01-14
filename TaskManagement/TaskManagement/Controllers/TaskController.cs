using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using TaskManagement.Services;
using TaskManagement.Models;
using TaskManagement.DTOs;
using Microsoft.Extensions.Logging;
using TaskManagement.Data;

namespace TaskManagement.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [EnableCors("AllowAll")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly TaskManagementDbContext _context;
        private readonly ILogger<TaskController> _logger;

        public TaskController(
            ITaskService taskService,
            TaskManagementDbContext context,
            ILogger<TaskController> logger)
        {
            _taskService = taskService ?? throw new ArgumentNullException(nameof(taskService));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("project/{projectId}")]
        [EnableCors("AllowAll")]
        public async Task<IActionResult> GetTasksByProject(int projectId)
        {
            try
            {
                _logger.LogInformation("Fetching tasks for project {ProjectId}", projectId);
                var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);

                if (tasks == null)
                {
                    return Ok(Array.Empty<TaskItem>());
                }
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tasks for project {ProjectId}", projectId);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            try
            {
                var task = await _taskService.GetTaskByIdAsync(id);
                if (task == null)
                {
                    return NotFound(new { message = $"Task with ID {id} not found" });
                }
                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching task {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto taskDto)
        {
            try
            {
                var userId = User.Identity?.Name ?? "system"; // In real app, get from authenticated user
                var createdTask = await _taskService.CreateTaskAsync(taskDto, userId);
                return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto taskDto)
        {
            try
            {
                var updatedTask = await _taskService.UpdateTaskAsync(id, taskDto);
                return Ok(updatedTask);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] TaskItemStatus status)
        {
            try
            {
                var result = await _taskService.UpdateTaskStatusAsync(id, status);
                if (!result)
                {
                    return NotFound(new { message = $"Task with ID {id} not found" });
                }
                return Ok(new { message = "Task status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for task {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] string content)
        {
            try
            {
                var userId = User.Identity?.Name ?? "system"; // In real app, get from authenticated user
                var comment = await _taskService.AddCommentAsync(id, content, userId);
                return Ok(comment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment to task {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost("{id}/attachments")]
        public async Task<IActionResult> AddAttachment(int id, IFormFile file)
        {
            try
            {
                var userId = User.Identity?.Name ?? "system";

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine("uploads", fileName);

                var attachment = await _taskService.AddAttachmentAsync(
                    id,
                    fileName,
                    filePath,
                    file.ContentType,
                    file.Length,
                    userId
                );

                return Ok(attachment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding attachment to task {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int id, int commentId)
        {
            try
            {
                var result = await _taskService.DeleteCommentAsync(id, commentId);
                if (!result)
                {
                    return NotFound(new { message = "Comment not found" });
                }
                return Ok(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {CommentId} from task {TaskId}", commentId, id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}/attachments/{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(int id, int attachmentId)
        {
            try
            {
                var result = await _taskService.DeleteAttachmentAsync(id, attachmentId);
                if (!result)
                {
                    return NotFound(new { message = "Attachment not found" });
                }
                return Ok(new { message = "Attachment deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting attachment {AttachmentId} from task {TaskId}", attachmentId, id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                await _taskService.DeleteTaskAsync(id);
                return Ok(new { message = "Task deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}