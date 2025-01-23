// TaskManagementDbContext.cs
using Microsoft.EntityFrameworkCore;
using TaskManagement.Models;

namespace TaskManagement.Data
{
    public class TaskManagementDbContext : DbContext
    {
        public TaskManagementDbContext(DbContextOptions<TaskManagementDbContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<TaskItem> TaskItems { get; set; } = null!;
        public DbSet<TaskComment> TaskComments { get; set; } = null!;
        public DbSet<TaskAttachment> TaskAttachments { get; set; } = null!;
        public DbSet<ProjectMember> ProjectMembers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Project configuration
            modelBuilder.Entity<Project>()
                .HasMany(p => p.TaskItems)
                .WithOne(t => t.Project)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasMany(p => p.TeamMembers)
                .WithOne(m => m.Project)
                .HasForeignKey(m => m.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            

            
            modelBuilder.Entity<TaskItem>()
                .HasMany(t => t.Comments)
                .WithOne(c => c.TaskItem)
                .HasForeignKey(c => c.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskItem>()
                .HasMany(t => t.Attachments)
                .WithOne(a => a.TaskItem)
                .HasForeignKey(a => a.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Labels as JSON array
            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Labels)
                .HasColumnType("text[]");
        }
    }
}