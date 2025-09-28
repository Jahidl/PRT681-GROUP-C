namespace ECommerce.Api.DTOs
{
    public class SubcategoryResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Image { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        
        // Navigation data
        public string? CategoryName { get; set; }
        public int ProductCount { get; set; }
    }

    public class CreateSubcategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Image { get; set; }
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
    }

    public class UpdateSubcategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Image { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }
}
