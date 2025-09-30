using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using ECommerce.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ECommerce.Api.Endpoints
{
    public static class JobEndpoints
    {
        public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/jobs");

            // GET all jobs with pagination
            group.MapGet("/", async (
                AppDbContext db,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 10,
                [FromQuery] JobStatus? status = null) =>
            {
                var query = db.CsvUploadJobs.AsQueryable();

                if (status.HasValue)
                {
                    query = query.Where(j => j.Status == status.Value);
                }

                var totalCount = await query.CountAsync();
                
                var jobs = await query
                    .OrderByDescending(j => j.CreatedAtUtc)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var jobResponses = jobs.Select(job => new JobStatusResponse
                {
                    Id = job.Id,
                    FileName = job.FileName,
                    Status = job.Status,
                    TotalRows = job.TotalRows,
                    ProcessedRows = job.ProcessedRows,
                    SuccessfulRows = job.SuccessfulRows,
                    FailedRows = job.FailedRows,
                    Errors = JsonSerializer.Deserialize<List<string>>(job.Errors) ?? new List<string>(),
                    CreatedProducts = JsonSerializer.Deserialize<List<ProductResponse>>(job.CreatedProducts) ?? new List<ProductResponse>(),
                    CreatedCategories = JsonSerializer.Deserialize<List<string>>(job.CreatedCategories) ?? new List<string>(),
                    CreatedSubcategories = JsonSerializer.Deserialize<List<string>>(job.CreatedSubcategories) ?? new List<string>(),
                    CreatedAtUtc = job.CreatedAtUtc,
                    StartedAtUtc = job.StartedAtUtc,
                    CompletedAtUtc = job.CompletedAtUtc,
                    ErrorMessage = job.ErrorMessage,
                    ProgressPercentage = job.ProgressPercentage,
                    FileSizeBytes = job.FileSizeBytes,
                    UploadedBy = job.UploadedBy
                }).ToList();

                var response = new JobListResponse
                {
                    Jobs = jobResponses,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                };

                return Results.Ok(response);
            })
            .WithName("GetJobs")
            .WithOpenApi();

            // GET job by ID
            group.MapGet("/{id}", async (string id, AppDbContext db) =>
            {
                var job = await db.CsvUploadJobs.FirstOrDefaultAsync(j => j.Id == id);
                
                if (job == null)
                {
                    return Results.NotFound(new { message = "Job not found" });
                }

                var response = new JobStatusResponse
                {
                    Id = job.Id,
                    FileName = job.FileName,
                    Status = job.Status,
                    TotalRows = job.TotalRows,
                    ProcessedRows = job.ProcessedRows,
                    SuccessfulRows = job.SuccessfulRows,
                    FailedRows = job.FailedRows,
                    Errors = JsonSerializer.Deserialize<List<string>>(job.Errors) ?? new List<string>(),
                    CreatedProducts = JsonSerializer.Deserialize<List<ProductResponse>>(job.CreatedProducts) ?? new List<ProductResponse>(),
                    CreatedCategories = JsonSerializer.Deserialize<List<string>>(job.CreatedCategories) ?? new List<string>(),
                    CreatedSubcategories = JsonSerializer.Deserialize<List<string>>(job.CreatedSubcategories) ?? new List<string>(),
                    CreatedAtUtc = job.CreatedAtUtc,
                    StartedAtUtc = job.StartedAtUtc,
                    CompletedAtUtc = job.CompletedAtUtc,
                    ErrorMessage = job.ErrorMessage,
                    ProgressPercentage = job.ProgressPercentage,
                    FileSizeBytes = job.FileSizeBytes,
                    UploadedBy = job.UploadedBy
                };

                return Results.Ok(response);
            })
            .WithName("GetJobById")
            .WithOpenApi();

            // POST create and queue job
            group.MapPost("/", async (
                [FromBody] CreateJobRequest request,
                AppDbContext db,
                IRabbitMQService rabbitMQ,
                ILogger<Program> logger) =>
            {
                try
                {
                    // Create job record
                    var job = new CsvUploadJob
                    {
                        Id = Guid.NewGuid().ToString(),
                        FileName = request.FileName,
                        Status = JobStatus.Queued,
                        FileSizeBytes = request.FileSizeBytes,
                        UploadedBy = request.UploadedBy
                    };

                    db.CsvUploadJobs.Add(job);
                    await db.SaveChangesAsync();

                    // Create message for RabbitMQ
                    var message = new CsvProcessingMessage
                    {
                        JobId = job.Id,
                        FileName = request.FileName,
                        CsvContent = request.CsvContent,
                        FileSizeBytes = request.FileSizeBytes,
                        UploadedBy = request.UploadedBy
                    };

                    // Queue the job
                    await rabbitMQ.PublishMessageAsync(message, "csv-processing-queue");

                    logger.LogInformation("CSV processing job queued: {JobId}", job.Id);

                    var response = new CreateJobResponse
                    {
                        JobId = job.Id,
                        Message = "CSV upload job has been queued for processing",
                        Status = job.Status,
                        CreatedAtUtc = job.CreatedAtUtc
                    };

                    return Results.Ok(response);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to create CSV processing job");
                    return Results.BadRequest(new { message = "Failed to queue job for processing" });
                }
            })
            .WithName("CreateJob")
            .WithOpenApi();

            // DELETE job (cancel if not completed)
            group.MapDelete("/{id}", async (string id, AppDbContext db, ILogger<Program> logger) =>
            {
                var job = await db.CsvUploadJobs.FirstOrDefaultAsync(j => j.Id == id);
                
                if (job == null)
                {
                    return Results.NotFound(new { message = "Job not found" });
                }

                if (job.Status == JobStatus.Processing)
                {
                    return Results.BadRequest(new { message = "Cannot delete job that is currently processing" });
                }

                if (job.Status == JobStatus.Queued)
                {
                    job.Status = JobStatus.Cancelled;
                    job.CompletedAtUtc = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                    
                    logger.LogInformation("Job cancelled: {JobId}", id);
                    return Results.Ok(new { message = "Job cancelled successfully" });
                }

                // For completed/failed jobs, actually delete them
                db.CsvUploadJobs.Remove(job);
                await db.SaveChangesAsync();
                
                logger.LogInformation("Job deleted: {JobId}", id);
                return Results.Ok(new { message = "Job deleted successfully" });
            })
            .WithName("DeleteJob")
            .WithOpenApi();

            // GET job statistics
            group.MapGet("/stats", async (AppDbContext db) =>
            {
                var stats = await db.CsvUploadJobs
                    .GroupBy(j => j.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync();

                var totalJobs = await db.CsvUploadJobs.CountAsync();
                var totalProductsCreated = await db.CsvUploadJobs
                    .Where(j => j.Status == JobStatus.Completed)
                    .SumAsync(j => j.SuccessfulRows);

                var result = new
                {
                    TotalJobs = totalJobs,
                    TotalProductsCreated = totalProductsCreated,
                    StatusBreakdown = stats.ToDictionary(s => s.Status.ToString(), s => s.Count),
                    QueuedJobs = stats.FirstOrDefault(s => s.Status == JobStatus.Queued)?.Count ?? 0,
                    ProcessingJobs = stats.FirstOrDefault(s => s.Status == JobStatus.Processing)?.Count ?? 0,
                    CompletedJobs = stats.FirstOrDefault(s => s.Status == JobStatus.Completed)?.Count ?? 0,
                    FailedJobs = stats.FirstOrDefault(s => s.Status == JobStatus.Failed)?.Count ?? 0
                };

                return Results.Ok(result);
            })
            .WithName("GetJobStats")
            .WithOpenApi();

            return routes;
        }
    }
}
