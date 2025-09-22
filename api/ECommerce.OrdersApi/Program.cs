using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

using ECommerce.OrdersApi;
using ECommerce.OrdersApi.Models;
using ECommerce.OrdersApi.Contracts;

var builder = WebApplication.CreateBuilder(args);

// --- DB ---
var conn = Environment.GetEnvironmentVariable("ORDERS_CONNECTION_STRING")
    ?? "Server=mssql,1433;Initial Catalog=orders;User Id=sa;Password=Your_password123;Trust Server Certificate=True;";
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(conn));

// --- Infra ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));

// --- HttpClient to Catalog API (Compose service or localhost in dev) ---
builder.Services.AddHttpClient("catalog", c =>
{
    c.BaseAddress = new Uri(Environment.GetEnvironmentVariable("CATALOG_BASE_URL")
        ?? "http://ecommerce.catalog:5000/"); // or http://localhost:5000/ when running locally
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

// Ensure DB exists (demo-friendly; use migrations for real apps)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// --- Endpoints ---

// Checkout -> creates an order by reading prices from Catalog
app.MapPost("/api/orders/checkout/{sessionId}", async (
    string sessionId,
    List<CheckoutLine> lines,
    AppDbContext db,
    IHttpClientFactory http) =>
{
    var client = http.CreateClient("catalog");
    decimal total = 0m;

    var order = new Order { SessionId = sessionId };

    foreach (var l in lines)
    {
        var p = await client.GetFromJsonAsync<ProductDto>($"api/catalog/products/{l.ProductId}");
        if (p is null) return Results.BadRequest($"Product {l.ProductId} not found.");

        order.Lines.Add(new OrderLine
        {
            ProductId = l.ProductId,
            Quantity  = l.Quantity,
            UnitPrice = p.Price
        });

        total += p.Price * l.Quantity;
    }

    order.Total = total;
    db.Orders.Add(order);
    await db.SaveChangesAsync();

    return Results.Created($"/api/orders/{order.Id}", order);
});

// Get recent orders for a session
app.MapGet("/api/orders/{sessionId}", async (string sessionId, AppDbContext db) =>
    await db.Orders.Where(o => o.SessionId == sessionId)
                   .OrderByDescending(o => o.Id)
                   .Take(20)
                   .ToListAsync());

app.Run();
