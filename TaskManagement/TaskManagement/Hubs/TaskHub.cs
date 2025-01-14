using Microsoft.AspNetCore.SignalR;
using TaskManagement.Models;

namespace TaskManagement.Hubs
{
    public class TaskHub : Hub
    {
        // Notify clients when a task is created
        public async Task NotifyTaskCreated(TaskItem task)
        {
            try
            {
                await Clients.All.SendAsync("TaskCreated", task);
            }
            catch (Exception ex)
            {
                // Log error (logging mechanism assumed to be in place)
                Console.WriteLine($"Error notifying task creation: {ex.Message}");
            }
        }

        // Notify clients when a task is updated
        public async Task NotifyTaskUpdated(TaskItem task)
        {
            try
            {
                await Clients.All.SendAsync("TaskUpdated", task);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error notifying task update: {ex.Message}");
            }
        }

        // Notify clients when a task is deleted
        public async Task NotifyTaskDeleted(int taskId)
        {
            try
            {
                await Clients.All.SendAsync("TaskDeleted", taskId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error notifying task deletion: {ex.Message}");
            }
        }

        // Notify clients when a project is created
        public async Task NotifyProjectCreated(Project project)
        {
            try
            {
                await Clients.All.SendAsync("ProjectCreated", project);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error notifying project creation: {ex.Message}");
            }
        }

        // Notify clients when a project is updated
        public async Task NotifyProjectUpdated(Project project)
        {
            try
            {
                await Clients.All.SendAsync("ProjectUpdated", project);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error notifying project update: {ex.Message}");
            }
        }

        // Notify clients when a project is deleted
        public async Task NotifyProjectDeleted(int projectId)
        {
            try
            {
                await Clients.All.SendAsync("ProjectDeleted", projectId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error notifying project deletion: {ex.Message}");
            }
        }
    }
}
