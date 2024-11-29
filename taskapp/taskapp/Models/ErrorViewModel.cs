namespace taskapp.Models
{
    public class ErrorViewModel
    {
        public string? RequestId { get; set; } // Nullable string for request ID
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId); // Boolean based on RequestId
    }
}
