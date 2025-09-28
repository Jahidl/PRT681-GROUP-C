using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.Api.Models
{
    public class Product
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? OriginalPrice { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? SubcategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Brand { get; set; } = string.Empty;

        [Range(0, 5)]
        public double Rating { get; set; } = 0;

        public int ReviewCount { get; set; } = 0;

        public bool InStock { get; set; } = true;

        public int StockCount { get; set; } = 0;

        // JSON stored as string - will be serialized/deserialized
        public string Images { get; set; } = "[]";

        public string Features { get; set; } = "[]";

        public string Specifications { get; set; } = "{}";

        public string Tags { get; set; } = "[]";

        public string? Sizes { get; set; }

        public string? Colors { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAtUtc { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        [ForeignKey("SubcategoryId")]
        public virtual Subcategory? Subcategory { get; set; }
    }
}
