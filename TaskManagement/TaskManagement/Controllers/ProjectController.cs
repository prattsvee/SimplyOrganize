using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskManagement.DTOs;
using TaskManagement.Services;
using TaskManagement.Helpers;
using TaskManagement.Models;

namespace TaskManagement.Controllers
{
    [ApiController]
    [Route("api/projects")]
   
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ILogger<ProjectController> _logger;

        public ProjectController(
            IProjectService projectService,
            ILogger<ProjectController> logger)
        {
            _projectService = projectService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectSummaryDto>>> GetAllProjects()
        {
            try
            {
                var projects = await _projectService.GetAllProjectsAsync();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching projects");
                return StatusCode(500, new { message = "Error fetching projects" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDetailsDto>> GetProjectById(int id)
        {
            try
            {
                var project = await _projectService.GetProjectByIdAsync(id);
                if (project == null)
                    return NotFound(new { message = "Project not found" });

                var dto = new ProjectDetailsDto
                {
                    Id = project.Id,
                    Name = project.Name,
                    ShortDescription = project.ShortDescription,
                    LongDescription = project.LongDescription,
                    ProjectKey = project.ProjectKey,
                    Status = project.Status.ToString(),
                    Type = project.Type.ToString(),
                    CreatedAt = project.CreatedAt,
                    UpdatedAt = project.UpdatedAt,
                    LeadId = project.LeadId,
                    DefaultAssigneeId = project.DefaultAssigneeId,
                    Progress = project.Progress,
                    TotalTasks = project.TaskItems.Count,
                    CompletedTasks = project.TaskItems.Count(t => Enum.Parse<TaskItemStatus>(t.Status) == TaskItemStatus.Done),
                    TeamMembers = project.TeamMembers.Select(m => new ProjectMemberDto
                    {
                        Id = m.Id,
                        UserId = m.UserId,
                        UserName = "User " + m.UserId, // Replace with actual user lookup
                        UserEmail = "user@example.com", // Replace with actual user lookup
                        JoinedAt = m.JoinedAt,
                        IsActive = m.IsActive
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching project {ProjectId}", id);
                return StatusCode(500, new { message = "Error fetching project details" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ProjectDetailsDto>> CreateProject([FromBody] CreateProjectDto createDto)
        {
            try
            {
                var createdProject = await _projectService.CreateProjectAsync(createDto);

                // Add project lead as team member
                await _projectService.AddTeamMemberAsync(createdProject.Id, createDto.LeadId);

                return CreatedAtAction(
                    nameof(GetProjectById),
                    new { id = createdProject.Id },
                    createdProject
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, new { message = "Error creating project" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto updateDto)
        {
            try
            {
                var updatedProject = await _projectService.UpdateProjectAsync(id, updateDto);
                return Ok(updatedProject);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Project not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project {ProjectId}", id);
                return StatusCode(500, new { message = "Error updating project" });
            }
        }

        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddTeamMember(int id, [FromBody] string userId)
        {
            try
            {
                await _projectService.AddTeamMemberAsync(id, userId);
                return Ok(new { message = "Team member added successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Project not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding team member to project {ProjectId}", id);
                return StatusCode(500, new { message = "Error adding team member" });
            }
        }

        [HttpDelete("{id}/members/{userId}")]
        public async Task<IActionResult> RemoveTeamMember(int id, string userId)
        {
            try
            {
                await _projectService.RemoveTeamMemberAsync(id, userId);
                return Ok(new { message = "Team member removed successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Project or team member not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing team member from project {ProjectId}", id);
                return StatusCode(500, new { message = "Error removing team member" });
            }
        }

        [HttpGet("{id}/tasks/summary")]
        public async Task<ActionResult> GetTasksSummary(int id)
        {
            try
            {
                var summary = await _projectService.GetTasksSummaryAsync(id);
                return Ok(new
                {
                    TotalTasks = summary.TotalTasks,
                    CompletedTasks = summary.CompletedTasks,
                    InProgressTasks = summary.InProgressTasks,
                    OverdueTasks = summary.OverdueTasks,
                    UpcomingTasks = summary.UpcomingTasks
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Project not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks summary for project {ProjectId}", id);
                return StatusCode(500, new { message = "Error getting tasks summary" });
            }
        }
    }
}