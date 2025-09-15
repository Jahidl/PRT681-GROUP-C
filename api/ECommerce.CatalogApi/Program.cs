using ECommerce.CatalogApi;
using ECommerce.CatalogApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var conn = Environment.GetEnvironmentVariable("CATALOG_CONNECTION_STRING")
    ?? "Server=localhost,11433;Initial Catalog=catalog;User Id=sa;Password=Your_password123;Trust Server Certificate=True;";

builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(conn));

// Swagger & CORS
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()
));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Sku="SKU-001", Name="Shovel", Price=19.99m, ImageUrl="/img/shovel.jpg" },
            new Product { Sku="SKU-002", Name="Rake",   Price=14.49m, ImageUrl="/img/rake.jpg" },
            new Product { Sku="SKU-003", Name="Barrow", Price=89.00m, ImageUrl="/img/wheelbarrow.jpg" }
        );
        db.SaveChanges();
    }
}

app.MapGet("/api/catalog/products", async (AppDbContext db) =>
    await db.Products.OrderBy(p => p.Id).ToListAsync());

app.Run();
