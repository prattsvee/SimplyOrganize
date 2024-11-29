using Microsoft.AspNetCore.Mvc;
using TaskManagement.Models;
using TaskManagement.Services;

namespace TaskManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(int projectId)
        {
            var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);
            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> Create(TaskItem taskItem)
        {
            var createdTask = await _taskService.CreateTaskAsync(taskItem);
            return Ok(createdTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TaskItem taskItem)
        {
            if (id != taskItem.Id) return BadRequest();
            var updatedTask = await _taskService.UpdateTaskAsync(taskItem);
            return Ok(updatedTask);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }
    }
}
