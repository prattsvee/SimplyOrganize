// DTOs/TaskDTOs.cs
namespace TaskManagement.DTOs
{
    public class TaskDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string LongDescription { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public string? AssigneeId { get; set; }
        public int EstimatedHours { get; set; }
        public int? LoggedHours { get; set; }
        public int? RemainingHours { get; set; }
        public int ProjectId { get; set; }
        public string[] Labels { get; set; } = Array.Empty<string>();
        public List<TaskCommentDto> Comments { get; set; } = new();
        public List<TaskAttachmentDto> Attachments { get; set; } = new();
    }

    public class CreateTaskDto
    {
        public required string Title { get; set; }
        public required string ShortDescription { get; set; }
        public required string LongDescription { get; set; }
        public required string Priority { get; set; } = "Medium";
        public required string Type { get; set; } = "Task";
        public DateTime? DueDate { get; set; }
        public string? AssigneeId { get; set; }
        public int EstimatedHours { get; set; }
        public required int ProjectId { get; set; }
        public string[] Labels { get; set; } = Array.Empty<string>();  // Changed from List<string>
    }

    public class UpdateTaskDto
    {
        public string? Title { get; set; }
        public string? ShortDescription { get; set; }
        public string? LongDescription { get; set; }
        public string? Priority { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public string? AssigneeId { get; set; }
        public int? EstimatedHours { get; set; }
        public string[]? Labels { get; set; }  // Changed from List<string>?
    }

    public class TaskCommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class TaskAttachmentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}