using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs
{
    public class CsvUploadResult
    {
        public int TotalRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<ProductResponse> CreatedProducts { get; set; } = new List<ProductResponse>();
        public List<string> CreatedCategories { get; set; } = new List<string>();
        public List<string> CreatedSubcategories { get; set; } = new List<string>();
    }

    public class CsvProductRow
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public string? SubcategoryId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public double Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;
        public bool InStock { get; set; } = true;
        public int StockCount { get; set; } = 0;
        public string Images { get; set; } = "[]"; // JSON array as string
        public string Features { get; set; } = "[]"; // JSON array as string
        public string Specifications { get; set; } = "{}"; // JSON object as string
        public string Tags { get; set; } = "[]"; // JSON array as string
        public string? Sizes { get; set; } // JSON array as string
        public string? Colors { get; set; } // JSON array as string
        public bool IsActive { get; set; } = true;
    }
}
