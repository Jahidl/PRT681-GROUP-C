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

            // LIST with search/sort/pagination  ✅ required params first
            group.MapGet("", async (
                AppDbContext db,
                [FromQuery] string? q,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 12,
                [FromQuery] string? sort = "nameAsc",
                [FromQuery] decimal? minPrice = null,
                [FromQuery] decimal? maxPrice = null) =>
            {
                page = page <= 0 ? 1 : page;
                pageSize = pageSize <= 0 ? 12 : pageSize;

                IQueryable<Product> query = db.Products.AsNoTracking();

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var term = q.Trim();
                    query = query.Where(p =>
                        p.Name.Contains(term) ||
                        (p.Description != null && p.Description.Contains(term)) ||
                        (p.Sku != null && p.Sku.Contains(term)));
                }

                if (minPrice.HasValue) query = query.Where(p => p.Price >= minPrice.Value);
                if (maxPrice.HasValue) query = query.Where(p => p.Price <= maxPrice.Value);

                query = sort?.ToLower() switch
                {
                    "priceasc" => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
                    "pricedesc" => query.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
                    "namedesc" => query.OrderByDescending(p => p.Name).ThenBy(p => p.Id),
                    _ => query.OrderBy(p => p.Name).ThenBy(p => p.Id)
                };

                var total = await query.CountAsync();
                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProductListItemDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        ImageUrl = p.ImageUrl,
                        Stock = p.Stock
                    })
                    .ToListAsync();

                var result = new PagedResult<ProductListItemDto>
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = total
                };
                return Results.Ok(result);
            });

            // GET by id
            group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            {
                var p = await db.Products.AsNoTracking()
                    .Where(x => x.Id == id)
                    .Select(p => new ProductDetailDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        Price = p.Price,
                        ImageUrl = p.ImageUrl,
                        Stock = p.Stock,
                        Sku = p.Sku,
                        CreatedAtUtc = p.CreatedAtUtc,
                        UpdatedAtUtc = p.UpdatedAtUtc
                    })
                    .FirstOrDefaultAsync();

                return p is null ? Results.NotFound() : Results.Ok(p);
            });

            // CREATE
            group.MapPost("", async ([FromBody] CreateProductRequest req, AppDbContext db) =>
            {
                var product = new Product
                {
                    Name = req.Name.Trim(),
                    Description = req.Description?.Trim(),
                    Price = req.Price,
                    ImageUrl = req.ImageUrl,
                    Stock = req.Stock,
                    Sku = req.Sku
                };

                db.Products.Add(product);
                await db.SaveChangesAsync();

                return Results.Created($"/api/products/{product.Id}", new { product.Id });
            });

            // UPDATE (partial)
            group.MapPut("/{id:int}", async (int id, [FromBody] UpdateProductRequest req, AppDbContext db) =>
            {
                var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
                if (p is null) return Results.NotFound();

                if (req.Name is not null) p.Name = req.Name.Trim();
                if (req.Description is not null) p.Description = req.Description.Trim();
                if (req.Price.HasValue) p.Price = req.Price.Value;
                if (req.ImageUrl is not null) p.ImageUrl = req.ImageUrl;
                if (req.Stock.HasValue) p.Stock = req.Stock.Value;
                if (req.Sku is not null) p.Sku = req.Sku;

                p.UpdatedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            // DELETE
            group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
            {
                var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
                if (p is null) return Results.NotFound();

                db.Products.Remove(p);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            return routes;
        }
    }
}
