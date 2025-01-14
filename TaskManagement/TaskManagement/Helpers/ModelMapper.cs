// Helpers/ModelMapper.cs
using TaskManagement.Models;
using TaskManagement.DTOs;

namespace TaskManagement.Helpers
{
    public static class ModelMapper


    {

        public static TaskCommentDto ToTaskCommentDto(TaskComment comment)
        {
            return new TaskCommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                AuthorId = comment.AuthorId,
                CreatedAt = comment.CreatedAt
            };
        }

        public static TaskAttachmentDto ToTaskAttachmentDto(TaskAttachment attachment)
        {
            return new TaskAttachmentDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                ContentType = attachment.ContentType,
                FileSize = attachment.FileSize,
                UploadedAt = attachment.UploadedAt
            };
        }

        public static ProjectMemberDto ToProjectMemberDto(ProjectMember member)
        {
            return new ProjectMemberDto
            {
                Id = member.Id,
                UserId = member.UserId,
                UserName = $"User {member.UserId}", // Replace with actual user lookup
                UserEmail = "user@example.com", // Replace with actual user lookup
                JoinedAt = member.JoinedAt,
                IsActive = member.IsActive
            };
        }

        public static TaskDetailsDto ToTaskDetailsDto(this TaskItem task)
        {
            return new TaskDetailsDto
            {
                Id = task.Id,
                Title = task.Title,
                ShortDescription = task.ShortDescription,
                LongDescription = task.LongDescription,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                Type = task.Type.ToString(),
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                DueDate = task.DueDate,
                AssigneeId = task.AssigneeId,
                EstimatedHours = task.EstimatedHours,
                Labels = task.Labels ?? Array.Empty<string>(),  // Direct assignment, no conversion needed
                ProjectId = task.ProjectId,
                Comments = task.Comments?.Select(ToCommentDto).ToList() ?? new List<TaskCommentDto>(),
                Attachments = task.Attachments?.Select(ToAttachmentDto).ToList() ?? new List<TaskAttachmentDto>()
            };
        }

        public static ProjectDetailsDto ToProjectDetailsDto(this Project project)
        {
            return new ProjectDetailsDto
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
                TeamMembers = project.TeamMembers.Select(ToProjectMemberDto).ToList()
            };
        }

        private static TaskCommentDto ToCommentDto(TaskComment comment)
        {
            return new TaskCommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                AuthorId = comment.AuthorId,
                CreatedAt = comment.CreatedAt
            };
        }

        private static TaskAttachmentDto ToAttachmentDto(TaskAttachment attachment)
        {
            return new TaskAttachmentDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                ContentType = attachment.ContentType,
                FileSize = attachment.FileSize,
                UploadedAt = attachment.UploadedAt
            };
        }
    }
}