using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Data;
using TaskManagement.Hubs; // Import TaskHub
using TaskManagement.Models;

namespace TaskManagement.Services
{
    public class TaskService : ITaskService
    {
        private readonly TaskManagementDbContext _context;
        private readonly IHubContext<TaskHub> _hubContext;

        public TaskService(TaskManagementDbContext context, IHubContext<TaskHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<TaskItem>> GetTasksByProjectIdAsync(int projectId)
        {
            return await _context.TaskItems.Where(t => t.ProjectId == projectId).ToListAsync();
        }

        public async Task<TaskItem> CreateTaskAsync(TaskItem taskItem)
        {
            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync();

            // Notify clients about the new task
            await _hubContext.Clients.All.SendAsync("TaskCreated", taskItem);

            return taskItem;
        }

        public async Task<TaskItem> UpdateTaskAsync(TaskItem taskItem)
        {
            _context.TaskItems.Update(taskItem);
            await _context.SaveChangesAsync();

            // Notify clients about the updated task
            await _hubContext.Clients.All.SendAsync("TaskUpdated", taskItem);

            return taskItem;
        }

        public async Task DeleteTaskAsync(int id)
        {
            var taskItem = await _context.TaskItems.FindAsync(id);
            if (taskItem != null)
            {
                _context.TaskItems.Remove(taskItem);
                await _context.SaveChangesAsync();

                // Notify clients about the deleted task
                await _hubContext.Clients.All.SendAsync("TaskDeleted", id);
            }
        }
    }
}
