using ECommerce.Api.Models;

namespace ECommerce.Api.DTOs
{
    public class JobStatusResponse
    {
        public string Id { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public JobStatus Status { get; set; }
        public int TotalRows { get; set; }
        public int ProcessedRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<ProductResponse> CreatedProducts { get; set; } = new List<ProductResponse>();
        public List<string> CreatedCategories { get; set; } = new List<string>();
        public List<string> CreatedSubcategories { get; set; } = new List<string>();
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? StartedAtUtc { get; set; }
        public DateTime? CompletedAtUtc { get; set; }
        public string? ErrorMessage { get; set; }
        public int ProgressPercentage { get; set; }
        public long FileSizeBytes { get; set; }
        public string? UploadedBy { get; set; }
        
        // Computed properties
        public TimeSpan? Duration => CompletedAtUtc.HasValue ? CompletedAtUtc.Value - CreatedAtUtc : null;
        public bool IsCompleted => Status == JobStatus.Completed || Status == JobStatus.Failed || Status == JobStatus.Cancelled;
        public string StatusText => Status switch
        {
            JobStatus.Queued => "Queued for processing",
            JobStatus.Processing => $"Processing... ({ProgressPercentage}%)",
            JobStatus.Completed => "Completed successfully",
            JobStatus.Failed => "Failed",
            JobStatus.Cancelled => "Cancelled",
            _ => "Unknown"
        };
    }

    public class CsvProcessingMessage
    {
        public string JobId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string CsvContent { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime QueuedAtUtc { get; set; } = DateTime.UtcNow;
        public string? UploadedBy { get; set; }
    }

    public class JobListResponse
    {
        public List<JobStatusResponse> Jobs { get; set; } = new List<JobStatusResponse>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage => (Page * PageSize) < TotalCount;
        public bool HasPreviousPage => Page > 1;
    }

    public class CreateJobRequest
    {
        public string FileName { get; set; } = string.Empty;
        public string CsvContent { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string? UploadedBy { get; set; }
    }

    public class CreateJobResponse
    {
        public string JobId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public JobStatus Status { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
