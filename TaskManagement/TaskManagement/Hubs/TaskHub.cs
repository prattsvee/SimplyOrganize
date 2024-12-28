using Microsoft.AspNetCore.SignalR;
using TaskManagement.Models;

namespace TaskManagement.Hubs
{
    public class TaskHub : Hub
    {
        // Send a real-time update when a task is created
        public async Task TaskCreated(TaskItem task)
        {
            await Clients.All.SendAsync("TaskCreated", task);
        }

        // Send a real-time update when a task is updated
        public async Task TaskUpdated(TaskItem task)
        {
            await Clients.All.SendAsync("TaskUpdated", task);
        }

        // Send a real-time update when a task is deleted
        public async Task TaskDeleted(int taskId)
        {
            await Clients.All.SendAsync("TaskDeleted", taskId);
        }
    }
}
