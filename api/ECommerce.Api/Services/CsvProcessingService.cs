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

        private async Task EnsureSubcategoryExistsAsync(string subcategoryId, string categoryId, HashSet<string> createdSubcategories)
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

        private async Task<Product> CreateProductAsync(CreateProductRequest request)
        {
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
