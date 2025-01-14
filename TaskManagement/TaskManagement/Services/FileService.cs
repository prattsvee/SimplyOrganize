// Services/FileService.cs
public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file);
    Task<(byte[] Content, string ContentType)?> GetFileAsync(string fileName);
    Task DeleteFileAsync(string fileName);
}

public class FileService : IFileService
{
    private readonly string _uploadPath;
    private readonly ILogger<FileService> _logger;

    public FileService(IConfiguration configuration, ILogger<FileService> logger)
    {
        _uploadPath = configuration["FileStorage:Path"] ?? "uploads";
        _logger = logger;

        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file)
    {
        try
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_uploadPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return fileName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file {FileName}", file.FileName);
            throw;
        }
    }

    public async Task<(byte[] Content, string ContentType)?> GetFileAsync(string fileName)
    {
        var filePath = Path.Combine(_uploadPath, fileName);
        if (!File.Exists(filePath))
            return null;

        try
        {
            var content = await File.ReadAllBytesAsync(filePath);
            var contentType = GetContentType(fileName);
            return (content, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading file {FileName}", fileName);
            throw;
        }
    }

    public Task DeleteFileAsync(string fileName)
    {
        var filePath = Path.Combine(_uploadPath, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }

    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };
    }
}