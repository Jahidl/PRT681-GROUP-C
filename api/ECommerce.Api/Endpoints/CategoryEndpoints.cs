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

            // Subcategory endpoints
            var subcategoryGroup = routes.MapGroup("/api/categories/{categoryId}/subcategories");

            // GET all subcategories for a category
            subcategoryGroup.MapGet("/", async (string categoryId, AppDbContext db) =>
            {
                var categoryExists = await db.Categories.AnyAsync(c => c.Id == categoryId);
                if (!categoryExists)
                {
                    return Results.NotFound(new { message = "Category not found" });
                }

                var subcategories = await db.Subcategories
                    .Include(s => s.Category)
                    .Where(s => s.CategoryId == categoryId && s.IsActive)
                    .OrderBy(s => s.SortOrder)
                    .ThenBy(s => s.Name)
                    .Select(s => new SubcategoryResponse
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Description = s.Description,
                        Image = s.Image,
                        CategoryId = s.CategoryId,
                        CreatedAtUtc = s.CreatedAtUtc,
                        UpdatedAtUtc = s.UpdatedAtUtc,
                        IsActive = s.IsActive,
                        SortOrder = s.SortOrder,
                        CategoryName = s.Category != null ? s.Category.Name : null,
                        ProductCount = s.Products.Count(p => p.IsActive)
                    })
                    .ToListAsync();

                return Results.Ok(subcategories);
            })
            .WithName("GetSubcategories")
            .WithOpenApi();

            // GET subcategory by ID
            subcategoryGroup.MapGet("/{id}", async (string categoryId, string id, AppDbContext db) =>
            {
                var subcategory = await db.Subcategories
                    .Include(s => s.Category)
                    .Where(s => s.Id == id && s.CategoryId == categoryId)
                    .Select(s => new SubcategoryResponse
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Description = s.Description,
                        Image = s.Image,
                        CategoryId = s.CategoryId,
                        CreatedAtUtc = s.CreatedAtUtc,
                        UpdatedAtUtc = s.UpdatedAtUtc,
                        IsActive = s.IsActive,
                        SortOrder = s.SortOrder,
                        CategoryName = s.Category != null ? s.Category.Name : null,
                        ProductCount = s.Products.Count(p => p.IsActive)
                    })
                    .FirstOrDefaultAsync();

                if (subcategory == null)
                {
                    return Results.NotFound();
                }

                return Results.Ok(subcategory);
            })
            .WithName("GetSubcategoryById")
            .WithOpenApi();

            // POST create subcategory
            subcategoryGroup.MapPost("/", async (string categoryId, [FromBody] CreateSubcategoryRequest request, AppDbContext db) =>
            {
                if (request == null)
                {
                    return Results.BadRequest(new { message = "Invalid request" });
                }

                var categoryExists = await db.Categories.AnyAsync(c => c.Id == categoryId);
                if (!categoryExists)
                {
                    return Results.NotFound(new { message = "Category not found" });
                }

                var name = request.Name.Trim();
                var exists = await db.Subcategories.AnyAsync(s => s.Name.ToLower() == name.ToLower() && s.CategoryId == categoryId);
                if (exists)
                {
                    return Results.Conflict(new { message = "Subcategory name already exists in this category" });
                }

                var subcategory = new Subcategory
                {
                    Name = name,
                    Description = request.Description.Trim(),
                    Image = request.Image?.Trim(),
                    CategoryId = categoryId,
                    IsActive = request.IsActive,
                    SortOrder = request.SortOrder
                };

                db.Subcategories.Add(subcategory);
                await db.SaveChangesAsync();

                var response = new SubcategoryResponse
                {
                    Id = subcategory.Id,
                    Name = subcategory.Name,
                    Description = subcategory.Description,
                    Image = subcategory.Image,
                    CategoryId = subcategory.CategoryId,
                    CreatedAtUtc = subcategory.CreatedAtUtc,
                    UpdatedAtUtc = subcategory.UpdatedAtUtc,
                    IsActive = subcategory.IsActive,
                    SortOrder = subcategory.SortOrder,
                    ProductCount = 0
                };

                return Results.Created($"/api/categories/{categoryId}/subcategories/{subcategory.Id}", response);
            })
            .WithName("CreateSubcategory")
            .WithOpenApi();

            // PUT update subcategory
            subcategoryGroup.MapPut("/{id}", async (string categoryId, string id, [FromBody] UpdateSubcategoryRequest request, AppDbContext db) =>
            {
                var subcategory = await db.Subcategories.FirstOrDefaultAsync(s => s.Id == id && s.CategoryId == categoryId);
                if (subcategory == null)
                {
                    return Results.NotFound();
                }

                var normalizedNewName = request.Name.Trim().ToLower();
                var nameTaken = await db.Subcategories.AnyAsync(s => s.Id != id && s.CategoryId == categoryId && s.Name.ToLower() == normalizedNewName);
                if (nameTaken)
                {
                    return Results.Conflict(new { message = "Subcategory name already exists in this category" });
                }

                subcategory.Name = request.Name.Trim();
                subcategory.Description = request.Description.Trim();
                subcategory.Image = request.Image?.Trim();
                subcategory.IsActive = request.IsActive;
                subcategory.SortOrder = request.SortOrder;
                subcategory.UpdatedAtUtc = DateTime.UtcNow;

                await db.SaveChangesAsync();

                return Results.Ok(new SubcategoryResponse
                {
                    Id = subcategory.Id,
                    Name = subcategory.Name,
                    Description = subcategory.Description,
                    Image = subcategory.Image,
                    CategoryId = subcategory.CategoryId,
                    CreatedAtUtc = subcategory.CreatedAtUtc,
                    UpdatedAtUtc = subcategory.UpdatedAtUtc,
                    IsActive = subcategory.IsActive,
                    SortOrder = subcategory.SortOrder,
                    ProductCount = subcategory.Products.Count(p => p.IsActive)
                });
            })
            .WithName("UpdateSubcategory")
            .WithOpenApi();

            // DELETE subcategory
            subcategoryGroup.MapDelete("/{id}", async (string categoryId, string id, AppDbContext db) =>
            {
                var subcategory = await db.Subcategories.FirstOrDefaultAsync(s => s.Id == id && s.CategoryId == categoryId);
                if (subcategory == null)
                {
                    return Results.NotFound();
                }

                // Check if there are products using this subcategory
                var hasProducts = await db.Products.AnyAsync(p => p.SubcategoryId == id);
                if (hasProducts)
                {
                    return Results.BadRequest(new { message = "Cannot delete subcategory that has products. Please reassign or delete the products first." });
                }

                db.Subcategories.Remove(subcategory);
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .WithName("DeleteSubcategory")
            .WithOpenApi();

            return routes;
        }
    }
}
