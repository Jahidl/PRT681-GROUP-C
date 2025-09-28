namespace ECommerce.Api.DTOs
{
    public class ProductResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public string? SubcategoryId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool InStock { get; set; }
        public int StockCount { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Features { get; set; } = new();
        public Dictionary<string, string> Specifications { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<string>? Sizes { get; set; }
        public List<string>? Colors { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
        public bool IsActive { get; set; }
        
        // Navigation data
        public string? CategoryName { get; set; }
        public string? SubcategoryName { get; set; }
    }

    public class CreateProductRequest
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
        public List<string> Images { get; set; } = new();
        public List<string> Features { get; set; } = new();
        public Dictionary<string, string> Specifications { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<string>? Sizes { get; set; }
        public List<string>? Colors { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public string? SubcategoryId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool InStock { get; set; }
        public int StockCount { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Features { get; set; } = new();
        public Dictionary<string, string> Specifications { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<string>? Sizes { get; set; }
        public List<string>? Colors { get; set; }
        public bool IsActive { get; set; }
    }
}
