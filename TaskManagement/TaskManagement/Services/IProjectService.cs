// IProjectService.cs
using TaskManagement.Models;
using TaskManagement.DTOs;

namespace TaskManagement.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDetailsDto>> GetAllProjectsAsync();
        Task<ProjectDetailsDto?> GetProjectByIdAsync(int id);
        Task<ProjectDetailsDto> CreateProjectAsync(CreateProjectDto projectDto);
        Task<ProjectDetailsDto> UpdateProjectAsync(int id, UpdateProjectDto projectDto);
        Task DeleteProjectAsync(int id);
        Task AddTeamMemberAsync(int projectId, string userId);
        Task RemoveTeamMemberAsync(int projectId, string userId);
        Task<TasksSummary> GetTasksSummaryAsync(int projectId);
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