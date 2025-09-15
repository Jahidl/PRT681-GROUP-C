namespace ECommerce.OrdersApi.Contracts;

public record CheckoutLine(int ProductId, int Quantity);

public record ProductDto(
    int Id,
    string Sku,
    string Name,
    string Description,
    decimal Price,
    string ImageUrl
);