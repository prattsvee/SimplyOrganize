using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        // Navigation property
        public ICollection<TaskItem> TaskItems { get; set; } = new List<TaskItem>();
    }
}
