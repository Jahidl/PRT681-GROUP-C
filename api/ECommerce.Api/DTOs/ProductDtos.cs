using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs
{
    public record ProductDto(
        int Id, string Title, string? Author, string? Description,
        decimal Price, string? ImageUrl, int? CategoryId, int Stock
    );

    public class CreateProductRequest
    {
        [Required, MaxLength(180)] public string Title { get; set; } = string.Empty;
        [MaxLength(180)] public string? Author { get; set; }
        [MaxLength(4000)] public string? Description { get; set; }
        [Range(0, 999999.99)] public decimal Price { get; set; }
        [MaxLength(512)] public string? ImageUrl { get; set; }
        public int? CategoryId { get; set; }
        public int Stock { get; set; } = 0;
    }

    public class UpdateProductRequest : CreateProductRequest { }
}
