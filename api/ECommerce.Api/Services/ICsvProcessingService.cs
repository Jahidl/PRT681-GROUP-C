using ECommerce.Api.DTOs;

namespace ECommerce.Api.Services
{
    public class CsvProcessingProgress
    {
        public int TotalRows { get; set; }
        public int ProcessedRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public int ProgressPercentage => TotalRows > 0 ? (ProcessedRows * 100) / TotalRows : 0;
        public List<string> CurrentErrors { get; set; } = new List<string>();
    }

    public class CsvProcessingResult
    {
        public int TotalRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<ProductResponse> CreatedProducts { get; set; } = new List<ProductResponse>();
        public List<string> CreatedCategories { get; set; } = new List<string>();
        public List<string> CreatedSubcategories { get; set; } = new List<string>();
    }

    public interface ICsvProcessingService
    {
        Task<CsvProcessingResult> ProcessCsvAsync(
            string csvContent, 
            string jobId,
            Func<CsvProcessingProgress, Task>? progressCallback = null);
    }
}
