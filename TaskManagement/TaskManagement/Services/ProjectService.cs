using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskManagement.Models;
using TaskManagement.DTOs;
using TaskManagement.Data;
using TaskManagement.Helpers;

namespace TaskManagement.Services
{
    public class ProjectService : IProjectService
    {
        private readonly TaskManagementDbContext _context;
        private readonly ILogger<ProjectService> _logger;

        public ProjectService(
            TaskManagementDbContext context,
            ILogger<ProjectService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<ProjectDetailsDto>> GetAllProjectsAsync()
        {
            try
            {
                // First, get just the basic project data
                var projects = await _context.Projects
                    .Select(p => new ProjectDetailsDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ShortDescription = p.ShortDescription,
                        LongDescription = p.LongDescription,
                        ProjectKey = p.ProjectKey,
                        Status = p.Status.ToString(),
                        Type = p.Type.ToString(),
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt,
                        LeadId = p.LeadId,
                        DefaultAssigneeId = p.DefaultAssigneeId,
                        Progress = 0, // Will calculate this separately if needed
                        TeamMembers = p.TeamMembers.Select(m => new ProjectMemberDto
                        {
                            Id = m.Id,
                            UserId = m.UserId,
                            UserName = "User " + m.UserId,
                            UserEmail = "user@example.com",
                            JoinedAt = m.JoinedAt,
                            IsActive = m.IsActive
                        }).ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} projects", projects.Count);
                return projects;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all projects");
                throw;
            }
        }

        public async Task<ProjectDetailsDto?> GetProjectByIdAsync(int id)
        {
            try
            {
                var project = await _context.Projects
                    .Include(p => p.TaskItems)
                    .Include(p => p.TeamMembers)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (project == null)
                {
                    _logger.LogWarning("Project with ID {ProjectId} not found", id);
                    return null;
                }

                return ModelMapper.ToProjectDetailsDto(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project with ID {ProjectId}", id);
                throw;
            }
        }

        public async Task<ProjectDetailsDto> CreateProjectAsync(CreateProjectDto projectDto)
        {
            try
            {
                var project = new Project
                {
                    Name = projectDto.Name,
                    ShortDescription = projectDto.ShortDescription,
                    LongDescription = projectDto.LongDescription,
                    ProjectKey = projectDto.ProjectKey,
                    Type = Enum.Parse<ProjectType>(projectDto.Type),
                    Status = ProjectStatus.Active,
                    LeadId = projectDto.LeadId,
                    DefaultAssigneeId = projectDto.DefaultAssigneeId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                // Add project lead as team member
                await AddTeamMemberAsync(project.Id, project.LeadId);

                _logger.LogInformation("Created new project with ID {ProjectId}", project.Id);
                return ModelMapper.ToProjectDetailsDto(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating new project");
                throw;
            }
        }

        public async Task<ProjectDetailsDto> UpdateProjectAsync(int id, UpdateProjectDto projectDto)
        {
            try
            {
                var project = await _context.Projects
                    .Include(p => p.TaskItems)
                    .Include(p => p.TeamMembers)
                    .FirstOrDefaultAsync(p => p.Id == id)
                    ?? throw new KeyNotFoundException($"Project {id} not found");

                if (projectDto.Name != null)
                    project.Name = projectDto.Name;
                if (projectDto.ShortDescription != null)
                    project.ShortDescription = projectDto.ShortDescription;
                if (projectDto.LongDescription != null)
                    project.LongDescription = projectDto.LongDescription;
                if (projectDto.Type != null && Enum.TryParse<ProjectType>(projectDto.Type, out var type))
                    project.Type = type;
                if (projectDto.Status != null && Enum.TryParse<ProjectStatus>(projectDto.Status, out var status))
                    project.Status = status;
                if (projectDto.LeadId != null)
                    project.LeadId = projectDto.LeadId;
                if (projectDto.DefaultAssigneeId != null)
                    project.DefaultAssigneeId = projectDto.DefaultAssigneeId;

                project.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated project with ID {ProjectId}", id);
                return ModelMapper.ToProjectDetailsDto(project);
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project with ID {ProjectId}", id);
                throw;
            }
        }

        public async Task DeleteProjectAsync(int id)
        {
            try
            {
                var project = await _context.Projects.FindAsync(id)
                    ?? throw new KeyNotFoundException($"Project {id} not found");

                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Deleted project with ID {ProjectId}", id);
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project with ID {ProjectId}", id);
                throw;
            }
        }

        public async Task AddTeamMemberAsync(int projectId, string userId)
        {
            try
            {
                var project = await _context.Projects.FindAsync(projectId)
                    ?? throw new KeyNotFoundException($"Project {projectId} not found");

                if (await _context.ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == userId))
                {
                    _logger.LogInformation("User {UserId} is already a member of project {ProjectId}", userId, projectId);
                    return;
                }

                var member = new ProjectMember
                {
                    ProjectId = projectId,
                    UserId = userId,
                    JoinedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.ProjectMembers.Add(member);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Added user {UserId} to project {ProjectId}", userId, projectId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding team member {UserId} to project {ProjectId}", userId, projectId);
                throw;
            }
        }

        public async Task RemoveTeamMemberAsync(int projectId, string userId)
        {
            try
            {
                var member = await _context.ProjectMembers
                    .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId)
                    ?? throw new KeyNotFoundException("Team member not found");

                _context.ProjectMembers.Remove(member);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Removed user {UserId} from project {ProjectId}", userId, projectId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing team member {UserId} from project {ProjectId}", userId, projectId);
                throw;
            }
        }

        public async Task<TasksSummary> GetTasksSummaryAsync(int projectId)
        {
            try
            {
                var project = await _context.Projects
                    .Include(p => p.TaskItems)
                    .FirstOrDefaultAsync(p => p.Id == projectId)
                    ?? throw new KeyNotFoundException($"Project {projectId} not found");

                var today = DateTime.UtcNow.Date;
                var nextWeek = today.AddDays(7);

                var summary = new TasksSummary
                {
                    TotalTasks = project.TaskItems.Count,
                    CompletedTasks = project.TaskItems.Count(t => t.Status == TaskItemStatus.Done),
                    InProgressTasks = project.TaskItems.Count(t =>
                        t.Status == TaskItemStatus.InProgress ||
                        t.Status == TaskItemStatus.Review ||
                        t.Status == TaskItemStatus.Testing),
                    OverdueTasks = project.TaskItems.Count(t =>
                        t.Status != TaskItemStatus.Done &&
                        t.DueDate.HasValue &&
                        t.DueDate.Value.Date < today),
                    UpcomingTasks = project.TaskItems.Count(t =>
                        t.Status != TaskItemStatus.Done &&
                        t.DueDate.HasValue &&
                        t.DueDate.Value.Date >= today &&
                        t.DueDate.Value.Date <= nextWeek)
                };

                _logger.LogInformation("Retrieved task summary for project {ProjectId}", projectId);
                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task summary for project {ProjectId}", projectId);
                throw;
            }
        }
    }
}