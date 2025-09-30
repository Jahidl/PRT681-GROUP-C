using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
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

            // POST upload CSV
            group.MapPost("/upload-csv", async (IFormFile file, AppDbContext db) =>
            {
                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new { message = "No file uploaded" });
                }

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.BadRequest(new { message = "File must be a CSV file" });
                }

                var result = new CsvUploadResult();
                var createdProducts = new List<ProductResponse>();
                var errors = new List<string>();

                try
                {
                    using var reader = new StreamReader(file.OpenReadStream());
                    var csvContent = await reader.ReadToEndAsync();
                    var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                    
                    if (lines.Length < 2)
                    {
                        return Results.BadRequest(new { message = "CSV file must contain at least a header row and one data row" });
                    }

                    // Skip header row
                    result.TotalRows = lines.Length - 1;

                    // Get existing categories and subcategories for validation
                    var categories = await db.Categories.ToDictionaryAsync(c => c.Id, c => c);
                    var subcategories = await db.Subcategories.ToDictionaryAsync(s => s.Id, s => s);

                    for (int i = 1; i < lines.Length; i++)
                    {
                        var line = lines[i].Trim();
                        if (string.IsNullOrEmpty(line)) continue;

                        try
                        {
                            var csvRow = ParseCsvRow(line);
                            
                            // Validate required fields
                            if (string.IsNullOrEmpty(csvRow.Id) || string.IsNullOrEmpty(csvRow.Name) || 
                                string.IsNullOrEmpty(csvRow.CategoryId) || string.IsNullOrEmpty(csvRow.Brand))
                            {
                                errors.Add($"Row {i}: Missing required fields (Id, Name, CategoryId, Brand)");
                                result.FailedRows++;
                                continue;
                            }

                            // Check if product already exists
                            var exists = await db.Products.AnyAsync(p => p.Id == csvRow.Id);
                            if (exists)
                            {
                                errors.Add($"Row {i}: Product with ID '{csvRow.Id}' already exists");
                                result.FailedRows++;
                                continue;
                            }

                            // Validate category exists
                            if (!categories.ContainsKey(csvRow.CategoryId))
                            {
                                errors.Add($"Row {i}: Category '{csvRow.CategoryId}' not found");
                                result.FailedRows++;
                                continue;
                            }

                            // Validate subcategory if provided
                            if (!string.IsNullOrEmpty(csvRow.SubcategoryId))
                            {
                                if (!subcategories.ContainsKey(csvRow.SubcategoryId) || 
                                    subcategories[csvRow.SubcategoryId].CategoryId != csvRow.CategoryId)
                                {
                                    errors.Add($"Row {i}: Subcategory '{csvRow.SubcategoryId}' not found or doesn't belong to category '{csvRow.CategoryId}'");
                                    result.FailedRows++;
                                    continue;
                                }
                            }

                            // Validate and parse JSON fields
                            List<string> images, features, tags, sizes = null, colors = null;
                            Dictionary<string, string> specifications;

                            try
                            {
                                images = JsonSerializer.Deserialize<List<string>>(csvRow.Images) ?? new List<string>();
                                features = JsonSerializer.Deserialize<List<string>>(csvRow.Features) ?? new List<string>();
                                specifications = JsonSerializer.Deserialize<Dictionary<string, string>>(csvRow.Specifications) ?? new Dictionary<string, string>();
                                tags = JsonSerializer.Deserialize<List<string>>(csvRow.Tags) ?? new List<string>();
                                
                                if (!string.IsNullOrEmpty(csvRow.Sizes))
                                    sizes = JsonSerializer.Deserialize<List<string>>(csvRow.Sizes);
                                if (!string.IsNullOrEmpty(csvRow.Colors))
                                    colors = JsonSerializer.Deserialize<List<string>>(csvRow.Colors);
                            }
                            catch (JsonException)
                            {
                                errors.Add($"Row {i}: Invalid JSON format in one or more fields");
                                result.FailedRows++;
                                continue;
                            }

                            // Create product
                            var product = new Product
                            {
                                Id = csvRow.Id.Trim(),
                                Name = csvRow.Name.Trim(),
                                Description = csvRow.Description.Trim(),
                                Price = csvRow.Price,
                                OriginalPrice = csvRow.OriginalPrice,
                                CategoryId = csvRow.CategoryId.Trim(),
                                SubcategoryId = string.IsNullOrEmpty(csvRow.SubcategoryId) ? null : csvRow.SubcategoryId.Trim(),
                                Brand = csvRow.Brand.Trim(),
                                Rating = csvRow.Rating,
                                ReviewCount = csvRow.ReviewCount,
                                InStock = csvRow.InStock,
                                StockCount = csvRow.StockCount,
                                Images = JsonSerializer.Serialize(images),
                                Features = JsonSerializer.Serialize(features),
                                Specifications = JsonSerializer.Serialize(specifications),
                                Tags = JsonSerializer.Serialize(tags),
                                Sizes = sizes != null ? JsonSerializer.Serialize(sizes) : null,
                                Colors = colors != null ? JsonSerializer.Serialize(colors) : null,
                                IsActive = csvRow.IsActive
                            };

                            db.Products.Add(product);
                            await db.SaveChangesAsync();

                            var productResponse = new ProductResponse
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
                                Images = images,
                                Features = features,
                                Specifications = specifications,
                                Tags = tags,
                                Sizes = sizes,
                                Colors = colors,
                                CreatedAtUtc = product.CreatedAtUtc,
                                UpdatedAtUtc = product.UpdatedAtUtc,
                                IsActive = product.IsActive,
                                CategoryName = categories[product.CategoryId].Name,
                                SubcategoryName = product.SubcategoryId != null ? subcategories[product.SubcategoryId].Name : null
                            };

                            createdProducts.Add(productResponse);
                            result.SuccessfulRows++;
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"Row {i}: {ex.Message}");
                            result.FailedRows++;
                        }
                    }

                    result.Errors = errors;
                    result.CreatedProducts = createdProducts;

                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new { message = $"Error processing CSV file: {ex.Message}" });
                }
            })
            .WithName("UploadProductsCsv")
            .WithOpenApi()
            .DisableAntiforgery();

            return routes;
        }

        private static CsvProductRow ParseCsvRow(string csvLine)
        {
            var values = new List<string>();
            var currentValue = new StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < csvLine.Length; i++)
            {
                char c = csvLine[i];

                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    values.Add(currentValue.ToString().Trim());
                    currentValue.Clear();
                }
                else
                {
                    currentValue.Append(c);
                }
            }

            // Add the last value
            values.Add(currentValue.ToString().Trim());

            // Ensure we have enough values (pad with empty strings if needed)
            while (values.Count < 19)
            {
                values.Add("");
            }

            return new CsvProductRow
            {
                Id = values[0],
                Name = values[1],
                Description = values[2],
                Price = decimal.TryParse(values[3], out var price) ? price : 0,
                OriginalPrice = decimal.TryParse(values[4], out var originalPrice) ? originalPrice : null,
                CategoryId = values[5],
                SubcategoryId = string.IsNullOrEmpty(values[6]) ? null : values[6],
                Brand = values[7],
                Rating = double.TryParse(values[8], out var rating) ? rating : 0,
                ReviewCount = int.TryParse(values[9], out var reviewCount) ? reviewCount : 0,
                InStock = bool.TryParse(values[10], out var inStock) ? inStock : true,
                StockCount = int.TryParse(values[11], out var stockCount) ? stockCount : 0,
                Images = string.IsNullOrEmpty(values[12]) ? "[]" : values[12],
                Features = string.IsNullOrEmpty(values[13]) ? "[]" : values[13],
                Specifications = string.IsNullOrEmpty(values[14]) ? "{}" : values[14],
                Tags = string.IsNullOrEmpty(values[15]) ? "[]" : values[15],
                Sizes = string.IsNullOrEmpty(values[16]) ? null : values[16],
                Colors = string.IsNullOrEmpty(values[17]) ? null : values[17],
                IsActive = bool.TryParse(values[18], out var isActive) ? isActive : true
            };
        }
    }
}
