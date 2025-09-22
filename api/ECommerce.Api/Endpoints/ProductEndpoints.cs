using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Endpoints
{
    public static class ProductEndpoints
    {
        public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/products");

            // GET /api/products?q=harry&page=1&pageSize=12&categoryId=3&sort=priceAsc
            group.MapGet("", async (
                AppDbContext db,                             // ← required service first
                [FromQuery] string? q,
                [FromQuery] int? categoryId,
                [FromQuery] string? sort,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 12) =>
            {
                page = Math.Max(1, page);
                pageSize = Math.Clamp(pageSize, 1, 100);

                var query = db.Products.AsQueryable();

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var term = q.Trim().ToLower();
                    query = query.Where(p =>
                        p.Title.ToLower().Contains(term) ||
                        (p.Author != null && p.Author.ToLower().Contains(term)));
                }

                if (categoryId.HasValue)
                    query = query.Where(p => p.CategoryId == categoryId);

                query = sort switch
                {
                    "priceAsc"  => query.OrderBy(p => p.Price),
                    "priceDesc" => query.OrderByDescending(p => p.Price),
                    "new"       => query.OrderByDescending(p => p.CreatedAtUtc),
                    _           => query.OrderBy(p => p.Title)
                };

                var total = await query.CountAsync();
                var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
                    .Select(p => new ProductDto(p.Id, p.Title, p.Author, p.Description,
                        p.Price, p.ImageUrl, p.CategoryId, p.Stock))
                    .ToListAsync();

                return Results.Ok(new { total, page, pageSize, items });
            });

            // GET /api/products/{id}
            group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            {
                var p = await db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
                return p is null
                    ? Results.NotFound()
                    : Results.Ok(new ProductDto(p.Id, p.Title, p.Author, p.Description,
                            p.Price, p.ImageUrl, p.CategoryId, p.Stock));
            });

            // ADMIN: create product
            group.MapPost("", async ([FromBody] CreateProductRequest req, AppDbContext db) =>
            {
                var p = new Product
                {
                    Title = req.Title.Trim(),
                    Author = string.IsNullOrWhiteSpace(req.Author) ? null : req.Author.Trim(),
                    Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
                    Price = req.Price,
                    ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim(),
                    CategoryId = req.CategoryId,
                    Stock = req.Stock
                };
                db.Products.Add(p);
                await db.SaveChangesAsync();

                return Results.Created($"/api/products/{p.Id}",
                    new ProductDto(p.Id, p.Title, p.Author, p.Description, p.Price, p.ImageUrl, p.CategoryId, p.Stock));
            });

            // ADMIN: update
            group.MapPut("/{id:int}", async (int id, [FromBody] UpdateProductRequest req, AppDbContext db) =>
            {
                var p = await db.Products.FindAsync(id);
                if (p is null) return Results.NotFound();

                p.Title = req.Title.Trim();
                p.Author = string.IsNullOrWhiteSpace(req.Author) ? null : req.Author.Trim();
                p.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
                p.Price = req.Price;
                p.ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim();
                p.CategoryId = req.CategoryId;
                p.Stock = req.Stock;
                p.UpdatedAtUtc = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            // ADMIN: delete
            group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
            {
                var p = await db.Products.FindAsync(id);
                if (p is null) return Results.NotFound();
                db.Products.Remove(p);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            return routes;
        }
    }
}
