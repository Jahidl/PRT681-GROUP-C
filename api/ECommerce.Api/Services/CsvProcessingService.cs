using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text.Json;

namespace ECommerce.Api.Services
{
    public class CsvProcessingService : ICsvProcessingService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<CsvProcessingService> _logger;

        public CsvProcessingService(AppDbContext dbContext, ILogger<CsvProcessingService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<CsvProcessingResult> ProcessCsvAsync(
            string csvContent, 
            string jobId,
            Func<CsvProcessingProgress, Task>? progressCallback = null)
        {
            var result = new CsvProcessingResult();
            var progress = new CsvProcessingProgress();
            var createdCategories = new HashSet<string>();
            var createdSubcategories = new HashSet<string>();

            try
            {
                var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                if (lines.Length < 2)
                {
                    throw new InvalidOperationException("CSV file must contain at least a header row and one data row");
                }

                var headers = ParseCsvLine(lines[0]);
                var dataRows = lines.Skip(1).ToArray();

                progress.TotalRows = dataRows.Length;
                result.TotalRows = dataRows.Length;

                _logger.LogInformation("Processing {TotalRows} rows for job {JobId}", progress.TotalRows, jobId);

                // Process each row
                for (int i = 0; i < dataRows.Length; i++)
                {
                    try
                    {
                        var rowData = ParseCsvLine(dataRows[i]);
                        if (rowData.Length != headers.Length)
                        {
                            var error = $"Row {i + 2}: Column count mismatch. Expected {headers.Length}, got {rowData.Length}";
                            result.Errors.Add(error);
                            progress.CurrentErrors.Add(error);
                            result.FailedRows++;
                            progress.FailedRows++;
                        }
                        else
                        {
                            var productData = CreateProductFromCsvRow(headers, rowData, i + 2);
                            
                            // Ensure category and subcategory exist
                            await EnsureCategoryExistsAsync(productData.CategoryId, createdCategories);
                            if (!string.IsNullOrEmpty(productData.SubcategoryId))
                            {
                                await EnsureSubcategoryExistsAsync(productData.SubcategoryId, productData.CategoryId, createdSubcategories);
                            }

                            // Create the product
                            var product = await CreateProductAsync(productData);
                            result.CreatedProducts.Add(ConvertToProductResponse(product));
                            result.SuccessfulRows++;
                            progress.SuccessfulRows++;
                        }
                    }
                    catch (Exception ex)
                    {
                        var error = $"Row {i + 2}: {ex.Message}";
                        result.Errors.Add(error);
                        progress.CurrentErrors.Add(error);
                        result.FailedRows++;
                        progress.FailedRows++;
                        _logger.LogWarning("Error processing row {RowNumber}: {Error}", i + 2, ex.Message);
                    }

                    progress.ProcessedRows++;

                    // Report progress every 10 rows or on the last row
                    if (progressCallback != null && (progress.ProcessedRows % 10 == 0 || progress.ProcessedRows == progress.TotalRows))
                    {
                        await progressCallback(progress);
                    }

                    // Add small delay to prevent overwhelming the database
                    if (i % 50 == 0)
                    {
                        await Task.Delay(10);
                    }
                }

                result.CreatedCategories = createdCategories.ToList();
                result.CreatedSubcategories = createdSubcategories.ToList();

                _logger.LogInformation("CSV processing completed for job {JobId}. Success: {Success}, Failed: {Failed}", 
                    jobId, result.SuccessfulRows, result.FailedRows);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing CSV for job {JobId}", jobId);
                throw;
            }
        }

        private string[] ParseCsvLine(string line)
        {
            var result = new List<string>();
            var current = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                    {
                        // Escaped quote
                        current.Append('"');
                        i++; // Skip next quote
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(current.ToString().Trim());
                    current.Clear();
                }
                else
                {
                    current.Append(c);
                }
            }

            result.Add(current.ToString().Trim());
            return result.ToArray();
        }

        private CreateProductRequest CreateProductFromCsvRow(string[] headers, string[] values, int rowNumber)
        {
            var product = new CreateProductRequest();

            for (int i = 0; i < headers.Length && i < values.Length; i++)
            {
                var header = headers[i].Trim().ToLowerInvariant();
                var value = values[i].Trim();

                try
                {
                    switch (header)
                    {
                        case "id":
                            product.Id = value;
                            break;
                        case "name":
                            product.Name = value;
                            break;
                        case "description":
                            product.Description = value;
                            break;
                        case "price":
                            product.Price = decimal.Parse(value, CultureInfo.InvariantCulture);
                            break;
                        case "originalprice":
                            if (!string.IsNullOrEmpty(value))
                                product.OriginalPrice = decimal.Parse(value, CultureInfo.InvariantCulture);
                            break;
                        case "categoryid":
                            product.CategoryId = value;
                            break;
                        case "subcategoryid":
                            product.SubcategoryId = value;
                            break;
                        case "brand":
                            product.Brand = value;
                            break;
                        case "rating":
                            product.Rating = double.Parse(value, CultureInfo.InvariantCulture);
                            break;
                        case "reviewcount":
                            product.ReviewCount = int.Parse(value);
                            break;
                        case "instock":
                            product.InStock = bool.Parse(value);
                            break;
                        case "stockcount":
                            product.StockCount = int.Parse(value);
                            break;
                        case "images":
                            product.Images = ParseJsonArray(value);
                            break;
                        case "features":
                            product.Features = ParseJsonArray(value);
                            break;
                        case "specifications":
                            product.Specifications = ParseJsonObject(value);
                            break;
                        case "tags":
                            product.Tags = ParseJsonArray(value);
                            break;
                        case "sizes":
                            if (!string.IsNullOrEmpty(value))
                                product.Sizes = ParseJsonArray(value);
                            break;
                        case "colors":
                            if (!string.IsNullOrEmpty(value))
                                product.Colors = ParseJsonArray(value);
                            break;
                        case "isactive":
                            product.IsActive = bool.Parse(value);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException($"Invalid value '{value}' for column '{header}': {ex.Message}");
                }
            }

            // Validate required fields
            if (string.IsNullOrEmpty(product.Id))
                throw new InvalidOperationException("Id is required");
            if (string.IsNullOrEmpty(product.Name))
                throw new InvalidOperationException("Name is required");
            if (string.IsNullOrEmpty(product.CategoryId))
                throw new InvalidOperationException("CategoryId is required");
            if (string.IsNullOrEmpty(product.Brand))
                throw new InvalidOperationException("Brand is required");

            return product;
        }

        private List<string> ParseJsonArray(string value)
        {
            if (string.IsNullOrEmpty(value))
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(value) ?? new List<string>();
            }
            catch
            {
                // Fallback: treat as comma-separated values
                return value.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList();
            }
        }

        private Dictionary<string, string> ParseJsonObject(string value)
        {
            if (string.IsNullOrEmpty(value))
                return new Dictionary<string, string>();

            try
            {
                return JsonSerializer.Deserialize<Dictionary<string, string>>(value) ?? new Dictionary<string, string>();
            }
            catch
            {
                return new Dictionary<string, string>();
            }
        }

        private async Task EnsureCategoryExistsAsync(string categoryId, HashSet<string> createdCategories)
        {
            try
            {
                var exists = await _dbContext.Categories.AnyAsync(c => c.Id == categoryId);
                if (!exists)
                {
                    var category = new Category
                    {
                        Id = categoryId,
                        Name = categoryId.Replace("-", " ").Replace("_", " "),
                        Description = $"Auto-created category: {categoryId}",
                        Image = "",
                        IsActive = true,
                        SortOrder = 0
                    };

                    _dbContext.Categories.Add(category);
                    await _dbContext.SaveChangesAsync();
                    createdCategories.Add(categoryId);
                    _logger.LogInformation("Created category: {CategoryId}", categoryId);
                }
            }
            catch (DbUpdateException ex)
            {
                // Handle database-specific errors for category creation
                if (ex.InnerException?.Message.Contains("UNIQUE constraint failed") == true)
                {
                    // Category might have been created by another process, check again
                    var exists = await _dbContext.Categories.AnyAsync(c => c.Id == categoryId);
                    if (exists)
                    {
                        _logger.LogInformation("Category {CategoryId} already exists (created by another process)", categoryId);
                        return; // Category exists, continue
                    }
                    throw new InvalidOperationException($"Failed to create category '{categoryId}': Category ID already exists");
                }
                else
                {
                    throw new InvalidOperationException($"Database error while creating category '{categoryId}': {ex.InnerException?.Message ?? ex.Message}");
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create category '{categoryId}': {ex.Message}");
            }
        }

        private async Task EnsureSubcategoryExistsAsync(string subcategoryId, string categoryId, HashSet<string> createdSubcategories)
        {
            try
            {
                var exists = await _dbContext.Subcategories.AnyAsync(s => s.Id == subcategoryId);
                if (!exists)
                {
                    var subcategory = new Subcategory
                    {
                        Id = subcategoryId,
                        Name = subcategoryId.Replace("-", " ").Replace("_", " "),
                        Description = $"Auto-created subcategory: {subcategoryId}",
                        CategoryId = categoryId,
                        IsActive = true,
                        SortOrder = 0
                    };

                    _dbContext.Subcategories.Add(subcategory);
                    await _dbContext.SaveChangesAsync();
                    createdSubcategories.Add(subcategoryId);
                    _logger.LogInformation("Created subcategory: {SubcategoryId} under category: {CategoryId}", subcategoryId, categoryId);
                }
            }
            catch (DbUpdateException ex)
            {
                // Handle database-specific errors for subcategory creation
                if (ex.InnerException?.Message.Contains("UNIQUE constraint failed") == true)
                {
                    // Subcategory might have been created by another process, check again
                    var exists = await _dbContext.Subcategories.AnyAsync(s => s.Id == subcategoryId);
                    if (exists)
                    {
                        _logger.LogInformation("Subcategory {SubcategoryId} already exists (created by another process)", subcategoryId);
                        return; // Subcategory exists, continue
                    }
                    throw new InvalidOperationException($"Failed to create subcategory '{subcategoryId}': Subcategory ID already exists");
                }
                else if (ex.InnerException?.Message.Contains("FOREIGN KEY constraint failed") == true)
                {
                    throw new InvalidOperationException($"Failed to create subcategory '{subcategoryId}': Invalid category reference '{categoryId}'. Please ensure the category exists");
                }
                else
                {
                    throw new InvalidOperationException($"Database error while creating subcategory '{subcategoryId}': {ex.InnerException?.Message ?? ex.Message}");
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create subcategory '{subcategoryId}': {ex.Message}");
            }
        }

        private async Task<Product> CreateProductAsync(CreateProductRequest request)
        {
            try
            {
                // Check if product with same ID already exists
                var existingProduct = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == request.Id);
                if (existingProduct != null)
                {
                    throw new InvalidOperationException($"Product with ID '{request.Id}' already exists");
                }

                var product = new Product
                {
                    Id = request.Id,
                    Name = request.Name,
                    Description = request.Description,
                    Price = request.Price,
                    OriginalPrice = request.OriginalPrice,
                    CategoryId = request.CategoryId,
                    SubcategoryId = request.SubcategoryId,
                    Brand = request.Brand,
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
                    CreatedAtUtc = DateTime.UtcNow,
                    IsActive = request.IsActive
                };

                _dbContext.Products.Add(product);
                await _dbContext.SaveChangesAsync();

                return product;
            }
            catch (DbUpdateException ex)
            {
                // Handle database-specific errors with more descriptive messages
                if (ex.InnerException?.Message.Contains("UNIQUE constraint failed") == true)
                {
                    throw new InvalidOperationException($"Product with ID '{request.Id}' already exists in the database");
                }
                else if (ex.InnerException?.Message.Contains("FOREIGN KEY constraint failed") == true)
                {
                    throw new InvalidOperationException($"Invalid category or subcategory reference for product '{request.Id}'. Please ensure the category '{request.CategoryId}' exists");
                }
                else if (ex.InnerException?.Message.Contains("NOT NULL constraint failed") == true)
                {
                    var field = ExtractFieldFromConstraintError(ex.InnerException.Message);
                    throw new InvalidOperationException($"Required field '{field}' is missing for product '{request.Id}'");
                }
                else
                {
                    throw new InvalidOperationException($"Database error while creating product '{request.Id}': {ex.InnerException?.Message ?? ex.Message}");
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create product '{request.Id}': {ex.Message}");
            }
        }

        private string ExtractFieldFromConstraintError(string errorMessage)
        {
            // Extract field name from SQLite constraint error messages
            if (errorMessage.Contains("Products."))
            {
                var start = errorMessage.IndexOf("Products.") + 9;
                var end = errorMessage.IndexOf(" ", start);
                if (end == -1) end = errorMessage.Length;
                return errorMessage.Substring(start, end - start);
            }
            return "unknown field";
        }

        private ProductResponse ConvertToProductResponse(Product product)
        {
            return new ProductResponse
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
                Images = ParseJsonArray(product.Images),
                Features = ParseJsonArray(product.Features),
                Specifications = ParseJsonObject(product.Specifications),
                Tags = ParseJsonArray(product.Tags),
                Sizes = product.Sizes != null ? ParseJsonArray(product.Sizes) : null,
                Colors = product.Colors != null ? ParseJsonArray(product.Colors) : null,
                CreatedAtUtc = product.CreatedAtUtc,
                UpdatedAtUtc = product.UpdatedAtUtc,
                IsActive = product.IsActive
            };
        }
    }
}
