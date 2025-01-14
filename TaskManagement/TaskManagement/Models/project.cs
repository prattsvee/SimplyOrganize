using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Models
{
    public enum ProjectStatus
    {
        Active,
        OnHold,
        Completed,
        Archived
    }

    public enum ProjectType
    {
        Software,
        Business,
        Marketing,
        Operations
    }

    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string ShortDescription { get; set; } = null!;

        [Required]
        [Column(TypeName = "text")]
        public string LongDescription { get; set; } = null!;

        [Required]
        [MaxLength(10)]
        public string ProjectKey { get; set; } = null!;

        public ProjectStatus Status { get; set; }
        public ProjectType Type { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public string LeadId { get; set; } = null!;
        public string? DefaultAssigneeId { get; set; }

        [NotMapped]
        public int Progress
        {
            get
            {
                if (!TaskItems.Any()) return 0;
                var completedTasks = TaskItems.Count(t => t.Status == TaskItemStatus.Done);
                return (int)((double)completedTasks / TaskItems.Count * 100);
            }
        }

        public virtual ICollection<TaskItem> TaskItems { get; set; } = new List<TaskItem>();
        public virtual ICollection<ProjectMember> TeamMembers { get; set; } = new List<ProjectMember>();
    }

    public class ProjectMember
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public int ProjectId { get; set; }
        public virtual Project Project { get; set; } = null!;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}