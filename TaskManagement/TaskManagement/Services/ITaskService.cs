using TaskManagement.Models;

namespace TaskManagement.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskItem>> GetTasksByProjectIdAsync(int projectId);
        Task<TaskItem> CreateTaskAsync(TaskItem taskItem);
        Task<TaskItem> UpdateTaskAsync(TaskItem taskItem);
        Task DeleteTaskAsync(int id);
    }
}
