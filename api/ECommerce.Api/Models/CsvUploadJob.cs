using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.Api.Models
{
    public enum JobStatus
    {
        Queued = 0,
        Processing = 1,
        Completed = 2,
        Failed = 3,
        Cancelled = 4
    }

    public class CsvUploadJob
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public JobStatus Status { get; set; } = JobStatus.Queued;

        public int TotalRows { get; set; } = 0;
        public int ProcessedRows { get; set; } = 0;
        public int SuccessfulRows { get; set; } = 0;
        public int FailedRows { get; set; } = 0;

        // JSON stored as string - will be serialized/deserialized
        public string Errors { get; set; } = "[]";
        public string CreatedProducts { get; set; } = "[]";
        public string CreatedCategories { get; set; } = "[]";
        public string CreatedSubcategories { get; set; } = "[]";

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAtUtc { get; set; }
        public DateTime? CompletedAtUtc { get; set; }

        [MaxLength(500)]
        public string? ErrorMessage { get; set; }

        // Progress percentage (0-100)
        public int ProgressPercentage { get; set; } = 0;

        // File size in bytes
        public long FileSizeBytes { get; set; } = 0;

        // User who uploaded the file (for future user management)
        [MaxLength(100)]
        public string? UploadedBy { get; set; }
    }
}
