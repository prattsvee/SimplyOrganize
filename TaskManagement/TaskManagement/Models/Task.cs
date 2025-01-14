// TaskItem.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.Models
{
    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum TaskItemStatus
    {
        Backlog,
        ToDo,
        InProgress,
        Review,
        Testing,
        Done
    }



    public enum TaskType
    {
        Task,
        Bug,
        Story,
        Epic
    }

    public class TaskItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string ShortDescription { get; set; } = null!;



        [Required]
        [Column(TypeName = "text")]
        public string LongDescription { get; set; } = null!;

        public TaskItemStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public TaskType Type { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public string? AssigneeId { get; set; }
        public string? ReporterId { get; set; }

        public int EstimatedHours { get; set; }
        public int? LoggedHours { get; set; }
        public int? RemainingHours { get; set; }

        [MaxLength(50)]
        public string[] Labels { get; set; } = Array.Empty<string>();

        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
        public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
    }

    public class TaskComment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; } = null!;
        public string AuthorId { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }

    public class TaskAttachment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public string UploadedById { get; set; } = null!;

        public int TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }
    public class TasksSummary
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int UpcomingTasks { get; set; }
    }
}