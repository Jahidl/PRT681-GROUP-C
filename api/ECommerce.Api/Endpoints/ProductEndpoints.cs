using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using ECommerce.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Globalization;
using System.Text;

namespace ECommerce.Api.Endpoints
{
    public static class ProductEndpoints
    {
        public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/products");

            // GET all products
            group.MapGet("/", async (AppDbContext db) =>
            {
                var productsData = await db.Products
                    .Include(p => p.Category)
                    .Include(p => p.Subcategory)
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Name)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Description,
                        p.Price,
                        p.OriginalPrice,
                        p.CategoryId,
                        p.SubcategoryId,
                        p.Brand,
                        p.Rating,
                        p.ReviewCount,
                        p.InStock,
                        p.StockCount,
                        p.Images,
                        p.Features,
                        p.Specifications,
                        p.Tags,
                        p.Sizes,
                        p.Colors,
                        p.CreatedAtUtc,
                        p.UpdatedAtUtc,
                        p.IsActive,
                        CategoryName = p.Category != null ? p.Category.Name : null,
                        SubcategoryName = p.Subcategory != null ? p.Subcategory.Name : null
                    })
                    .ToListAsync();

                var products = productsData.Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    OriginalPrice = p.OriginalPrice,
                    CategoryId = p.CategoryId,
                    SubcategoryId = p.SubcategoryId,
                    Brand = p.Brand,
                    Rating = p.Rating,
                    ReviewCount = p.ReviewCount,
                    InStock = p.InStock,
                    StockCount = p.StockCount,
                    Images = JsonSerializer.Deserialize<List<string>>(p.Images) ?? new List<string>(),
                    Features = JsonSerializer.Deserialize<List<string>>(p.Features) ?? new List<string>(),
                    Specifications = JsonSerializer.Deserialize<Dictionary<string, string>>(p.Specifications) ?? new Dictionary<string, string>(),
                    Tags = JsonSerializer.Deserialize<List<string>>(p.Tags) ?? new List<string>(),
                    Sizes = string.IsNullOrEmpty(p.Sizes) ? null : JsonSerializer.Deserialize<List<string>>(p.Sizes),
                    Colors = string.IsNullOrEmpty(p.Colors) ? null : JsonSerializer.Deserialize<List<string>>(p.Colors),
                    CreatedAtUtc = p.CreatedAtUtc,
                    UpdatedAtUtc = p.UpdatedAtUtc,
                    IsActive = p.IsActive,
                    CategoryName = p.CategoryName,
                    SubcategoryName = p.SubcategoryName
                }).ToList();

                return Results.Ok(products);
            })
            .WithName("GetProducts")
            .WithOpenApi();

            // GET product by ID
            group.MapGet("/{id}", async (string id, AppDbContext db) =>
            {
                var productData = await db.Products
                    .Include(p => p.Category)
                    .Include(p => p.Subcategory)
                    .Where(p => p.Id == id)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Description,
                        p.Price,
                        p.OriginalPrice,
                        p.CategoryId,
                        p.SubcategoryId,
                        p.Brand,
                        p.Rating,
                        p.ReviewCount,
                        p.InStock,
                        p.StockCount,
                        p.Images,
                        p.Features,
                        p.Specifications,
                        p.Tags,
                        p.Sizes,
                        p.Colors,
                        p.CreatedAtUtc,
                        p.UpdatedAtUtc,
                        p.IsActive,
                        CategoryName = p.Category != null ? p.Category.Name : null,
                        SubcategoryName = p.Subcategory != null ? p.Subcategory.Name : null
                    })
                    .FirstOrDefaultAsync();

                if (productData == null)
                {
                    return Results.NotFound();
                }

                var product = new ProductResponse
                {
                    Id = productData.Id,
                    Name = productData.Name,
                    Description = productData.Description,
                    Price = productData.Price,
                    OriginalPrice = productData.OriginalPrice,
                    CategoryId = productData.CategoryId,
                    SubcategoryId = productData.SubcategoryId,
                    Brand = productData.Brand,
                    Rating = productData.Rating,
                    ReviewCount = productData.ReviewCount,
                    InStock = productData.InStock,
                    StockCount = productData.StockCount,
                    Images = JsonSerializer.Deserialize<List<string>>(productData.Images) ?? new List<string>(),
                    Features = JsonSerializer.Deserialize<List<string>>(productData.Features) ?? new List<string>(),
                    Specifications = JsonSerializer.Deserialize<Dictionary<string, string>>(productData.Specifications) ?? new Dictionary<string, string>(),
                    Tags = JsonSerializer.Deserialize<List<string>>(productData.Tags) ?? new List<string>(),
                    Sizes = string.IsNullOrEmpty(productData.Sizes) ? null : JsonSerializer.Deserialize<List<string>>(productData.Sizes),
                    Colors = string.IsNullOrEmpty(productData.Colors) ? null : JsonSerializer.Deserialize<List<string>>(productData.Colors),
                    CreatedAtUtc = productData.CreatedAtUtc,
                    UpdatedAtUtc = productData.UpdatedAtUtc,
                    IsActive = productData.IsActive,
                    CategoryName = productData.CategoryName,
                    SubcategoryName = productData.SubcategoryName
                };

                return Results.Ok(product);
            })
            .WithName("GetProductById")
            .WithOpenApi();

            // POST create product
            group.MapPost("/", async ([FromBody] CreateProductRequest request, AppDbContext db) =>
            {
                if (request == null)
                {
                    return Results.BadRequest(new { message = "Invalid request" });
                }

                // Check if product ID already exists
                var exists = await db.Products.AnyAsync(p => p.Id == request.Id);
                if (exists)
                {
                    return Results.Conflict(new { message = "Product ID already exists" });
                }

                // Verify category exists
                var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId);
                if (!categoryExists)
                {
                    return Results.BadRequest(new { message = "Category not found" });
                }

                // Verify subcategory exists if provided
                if (!string.IsNullOrEmpty(request.SubcategoryId))
                {
                    var subcategoryExists = await db.Subcategories.AnyAsync(s => s.Id == request.SubcategoryId && s.CategoryId == request.CategoryId);
                    if (!subcategoryExists)
                    {
                        return Results.BadRequest(new { message = "Subcategory not found or doesn't belong to the specified category" });
                    }
                }

                var product = new Product
                {
                    Id = request.Id,
                    Name = request.Name.Trim(),
                    Description = request.Description.Trim(),
                    Price = request.Price,
                    OriginalPrice = request.OriginalPrice,
                    CategoryId = request.CategoryId,
                    SubcategoryId = request.SubcategoryId,
                    Brand = request.Brand.Trim(),
                    Rating = request.Rating,
                    ReviewCount = request.ReviewCount,
                    InStock = request.InStock,
                    StockCount = request.StockCount,
                    Images = JsonSerializer.Serialize(request.Images),
                    Features = JsonSerializer.Serialize(request.Features),
                    Specifications = JsonSerializer.Serialize(request.Specifications),
                    Tags = JsonSerializer.Serialize(request.Tags),
                    Sizes = request.Sizes != null ? JsonSerializer.Serialize(request.Sizes) : null,
                    Colors = request.Colors != null ? JsonSerializer.Serialize(request.Colors) : null,
                    IsActive = request.IsActive
                };

                db.Products.Add(product);
                await db.SaveChangesAsync();

                var response = new ProductResponse
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    OriginalPrice = product.OriginalPrice,
                    CategoryId = product.CategoryId,
                    SubcategoryId = product.SubcategoryId,
                    Brand = product.Brand,
                    Rating = product.Rating,
                    ReviewCount = product.ReviewCount,
                    InStock = product.InStock,
                    StockCount = product.StockCount,
                    Images = request.Images,
                    Features = request.Features,
                    Specifications = request.Specifications,
                    Tags = request.Tags,
                    Sizes = request.Sizes,
                    Colors = request.Colors,
                    CreatedAtUtc = product.CreatedAtUtc,
                    UpdatedAtUtc = product.UpdatedAtUtc,
                    IsActive = product.IsActive
                };

                return Results.Created($"/api/products/{product.Id}", response);
            })
            .WithName("CreateProduct")
            .WithOpenApi();

            // PUT update product
            group.MapPut("/{id}", async (string id, [FromBody] UpdateProductRequest request, AppDbContext db) =>
            {
                var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id);
                if (product == null)
                {
                    return Results.NotFound();
                }

                // Verify category exists
                var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId);
                if (!categoryExists)
                {
                    return Results.BadRequest(new { message = "Category not found" });
                }

                // Verify subcategory exists if provided
                if (!string.IsNullOrEmpty(request.SubcategoryId))
                {
                    var subcategoryExists = await db.Subcategories.AnyAsync(s => s.Id == request.SubcategoryId && s.CategoryId == request.CategoryId);
                    if (!subcategoryExists)
                    {
                        return Results.BadRequest(new { message = "Subcategory not found or doesn't belong to the specified category" });
                    }
                }

                product.Name = request.Name.Trim();
                product.Description = request.Description.Trim();
                product.Price = request.Price;
                product.OriginalPrice = request.OriginalPrice;
                product.CategoryId = request.CategoryId;
                product.SubcategoryId = request.SubcategoryId;
                product.Brand = request.Brand.Trim();
                product.Rating = request.Rating;
                product.ReviewCount = request.ReviewCount;
                product.InStock = request.InStock;
                product.StockCount = request.StockCount;
                product.Images = JsonSerializer.Serialize(request.Images);
                product.Features = JsonSerializer.Serialize(request.Features);
                product.Specifications = JsonSerializer.Serialize(request.Specifications);
                product.Tags = JsonSerializer.Serialize(request.Tags);
                product.Sizes = request.Sizes != null ? JsonSerializer.Serialize(request.Sizes) : null;
                product.Colors = request.Colors != null ? JsonSerializer.Serialize(request.Colors) : null;
                product.IsActive = request.IsActive;
                product.UpdatedAtUtc = DateTime.UtcNow;

                await db.SaveChangesAsync();

                return Results.Ok(new ProductResponse
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    OriginalPrice = product.OriginalPrice,
                    CategoryId = product.CategoryId,
                    SubcategoryId = product.SubcategoryId,
                    Brand = product.Brand,
                    Rating = product.Rating,
                    ReviewCount = product.ReviewCount,
                    InStock = product.InStock,
                    StockCount = product.StockCount,
                    Images = request.Images,
                    Features = request.Features,
                    Specifications = request.Specifications,
                    Tags = request.Tags,
                    Sizes = request.Sizes,
                    Colors = request.Colors,
                    CreatedAtUtc = product.CreatedAtUtc,
                    UpdatedAtUtc = product.UpdatedAtUtc,
                    IsActive = product.IsActive
                });
            })
            .WithName("UpdateProduct")
            .WithOpenApi();

            // DELETE product
            group.MapDelete("/{id}", async (string id, AppDbContext db) =>
            {
                var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id);
                if (product == null)
                {
                    return Results.NotFound();
                }

                db.Products.Remove(product);
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .WithName("DeleteProduct")
            .WithOpenApi();

            // POST upload CSV - Asynchronous with RabbitMQ
            group.MapPost("/upload-csv", async (IFormFile file, IRabbitMQService rabbitMQ, AppDbContext db, ILogger<Program> logger) =>
            {
                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new { message = "No file uploaded" });
                }

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.BadRequest(new { message = "File must be a CSV file" });
                }

                try
                {
                    // Read CSV content
                    using var reader = new StreamReader(file.OpenReadStream());
                    var csvContent = await reader.ReadToEndAsync();
                    
                    // Basic validation
                    var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                    if (lines.Length < 2)
                    {
                        return Results.BadRequest(new { message = "CSV file must contain at least a header row and one data row" });
                    }

                    // Create job record
                    var job = new CsvUploadJob
                    {
                        Id = Guid.NewGuid().ToString(),
                        FileName = file.FileName,
                        Status = JobStatus.Queued,
                        FileSizeBytes = file.Length,
                        UploadedBy = "admin" // TODO: Get from authentication context
                    };

                    db.CsvUploadJobs.Add(job);
                    await db.SaveChangesAsync();

                    // Create message for RabbitMQ
                    var message = new CsvProcessingMessage
                    {
                        JobId = job.Id,
                        FileName = file.FileName,
                        CsvContent = csvContent,
                        FileSizeBytes = file.Length,
                        UploadedBy = "admin" // TODO: Get from authentication context
                    };

                    // Queue the job
                    await rabbitMQ.PublishMessageAsync(message, "csv-processing-queue");

                    logger.LogInformation("CSV processing job queued: {JobId}", job.Id);

                    var response = new CreateJobResponse
                    {
                        JobId = job.Id,
                        Message = "CSV upload job has been queued for processing. Use the job ID to track progress.",
                        Status = job.Status,
                        CreatedAtUtc = job.CreatedAtUtc
                    };

                    return Results.Ok(response);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to queue CSV processing job");
                    return Results.BadRequest(new { message = "Failed to queue job for processing" });
                }
            })
            .WithName("UploadProductsCsv")
            .WithOpenApi()
            .DisableAntiforgery();

            return routes;
        }
    }
}
