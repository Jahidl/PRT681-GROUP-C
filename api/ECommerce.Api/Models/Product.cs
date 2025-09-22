using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.Api.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(180)]
        public string? Author { get; set; }

        [MaxLength(4000)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        [Range(0, 999999.99)]
        public decimal Price { get; set; }

        [MaxLength(512)]
        public string? ImageUrl { get; set; }

        public int? CategoryId { get; set; }              // optional: relate to your existing Category
        public Category? Category { get; set; }

        public int Stock { get; set; } = 0;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAtUtc { get; set; }
    }
}
