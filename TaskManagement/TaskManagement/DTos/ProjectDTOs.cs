using System;
using System.Collections.Generic;

namespace TaskManagement.DTOs
{
    public class ProjectMemberDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class ProjectSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ProjectKey { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Progress { get; set; }
        public string LeadName { get; set; } = string.Empty;
        public int TeamMemberCount { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ProjectDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string LongDescription { get; set; } = string.Empty;
        public string ProjectKey { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string LeadId { get; set; } = string.Empty;
        public string? DefaultAssigneeId { get; set; }
        public int Progress { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public List<TaskDetailsDto> Tasks { get; set; } = new();
        public List<ProjectMemberDto> TeamMembers { get; set; } = new();

        public List<TaskDetailsDto> TaskItems { get; set; } = new();
    }

    public class CreateProjectDto
    {
        public required string Name { get; set; }
        public required string ShortDescription { get; set; }
        public required string LongDescription { get; set; }
        public required string ProjectKey { get; set; }
        public required string Type { get; set; }
        public required string LeadId { get; set; }
        public string? DefaultAssigneeId { get; set; }
    }

    public class UpdateProjectDto
    {
        public string? Name { get; set; }
        public string? ShortDescription { get; set; }
        public string? LongDescription { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }
        public string? LeadId { get; set; }
        public string? DefaultAssigneeId { get; set; }
    }
}