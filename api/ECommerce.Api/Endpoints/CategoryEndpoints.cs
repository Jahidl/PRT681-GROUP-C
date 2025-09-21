using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Endpoints
{
    public static class CategoryEndpoints
    {
        public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/categories");

            // GET all categories
            group.MapGet("/", async (AppDbContext db) =>
            {
                var categories = await db.Categories
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.SortOrder)
                    .ThenBy(c => c.Name)
                    .Select(c => new CategoryResponse
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        Image = c.Image,
                        CreatedAtUtc = c.CreatedAtUtc,
                        UpdatedAtUtc = c.UpdatedAtUtc,
                        IsActive = c.IsActive,
                        SortOrder = c.SortOrder
                    })
                    .ToListAsync();

                return Results.Ok(categories);
            })
            .WithName("GetCategories")
            .WithOpenApi();

            // GET category by ID
            group.MapGet("/{id}", async (string id, AppDbContext db) =>
            {
                var category = await db.Categories
                    .Where(c => c.Id == id)
                    .Select(c => new CategoryResponse
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        Image = c.Image,
                        CreatedAtUtc = c.CreatedAtUtc,
                        UpdatedAtUtc = c.UpdatedAtUtc,
                        IsActive = c.IsActive,
                        SortOrder = c.SortOrder
                    })
                    .FirstOrDefaultAsync();

                if (category == null)
                {
                    return Results.NotFound();
                }

                return Results.Ok(category);
            })
            .WithName("GetCategoryById")
            .WithOpenApi();

            group.MapPost("/", async ([FromBody] CreateCategoryRequest request, AppDbContext db) =>
            {
                if (request == null)
                {
                    return Results.BadRequest(new { message = "Invalid request" });
                }

                var name = request.Name.Trim();
                var exists = await db.Categories.AnyAsync(c => c.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { message = "Category name already exists" });
                }

                var category = new Category
                {
                    Name = name,
                    Description = request.Description.Trim(),
                    Image = request.Image.Trim(),
                    IsActive = request.IsActive ?? true,
                    SortOrder = request.SortOrder ?? 0
                };

                db.Categories.Add(category);
                await db.SaveChangesAsync();

                var response = new CategoryResponse
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    Image = category.Image,
                    CreatedAtUtc = category.CreatedAtUtc,
                    UpdatedAtUtc = category.UpdatedAtUtc,
                    IsActive = category.IsActive,
                    SortOrder = category.SortOrder
                };

                return Results.Created($"/api/categories/{category.Id}", response);
            })
            .WithName("CreateCategory")
            .WithOpenApi();

            group.MapPut("/{id}", async (string id, [FromBody] UpdateCategoryRequest request, AppDbContext db) =>
            {
                var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id);
                if (category == null)
                {
                    return Results.NotFound();
                }

                var normalizedNewName = request.Name.Trim().ToLower();
                var nameTaken = await db.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == normalizedNewName);
                if (nameTaken)
                {
                    return Results.Conflict(new { message = "Category name already exists" });
                }

                category.Name = request.Name.Trim();
                category.Description = request.Description.Trim();
                category.Image = request.Image.Trim();
                category.IsActive = request.IsActive;
                category.SortOrder = request.SortOrder;
                category.UpdatedAtUtc = DateTime.UtcNow;

                await db.SaveChangesAsync();

                return Results.Ok(new CategoryResponse
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    Image = category.Image,
                    CreatedAtUtc = category.CreatedAtUtc,
                    UpdatedAtUtc = category.UpdatedAtUtc,
                    IsActive = category.IsActive,
                    SortOrder = category.SortOrder
                });
            })
            .WithName("UpdateCategory")
            .WithOpenApi();

            group.MapDelete("/{id}", async (string id, AppDbContext db) =>
            {
                var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id);
                if (category == null)
                {
                    return Results.NotFound();
                }

                db.Categories.Remove(category);
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .WithName("DeleteCategory")
            .WithOpenApi();

            return routes;
        }
    }
}
