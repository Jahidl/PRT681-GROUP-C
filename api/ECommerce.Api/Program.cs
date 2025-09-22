using ECommerce.Api.Data;
using ECommerce.Api.Endpoints;
using Microsoft.EntityFrameworkCore;
using FluentMigrator.Runner;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add Swagger generation for UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for local frontends
const string DevCorsPolicy = "DevCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure EF Core SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? "Server=host.docker.internal,1433;Database=SportStoreDb;Trusted_Connection=False;MultipleActiveResultSets=true;TrustServerCertificate=True;Encrypt=True;User Id=sa;Password=Your_strong_password123";

// Only add SQL Server DbContext and FluentMigrator if not in testing environment
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer(connectionString);
    });

    // Add FluentMigrator services
    builder.Services
        .AddFluentMigratorCore()
        .ConfigureRunner(rb => rb
            .AddSqlServer()
            .WithGlobalConnectionString(connectionString)
            .ScanIn(Assembly.GetExecutingAssembly()).For.Migrations())
        .AddLogging(lb => lb.AddFluentMigratorConsole());
}

var app = builder.Build();

// Run FluentMigrator migrations (skip in testing environment)
if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            logger.LogInformation("Starting database migrations...");
            
            // Run migrations
            runner.MigrateUp();
            
            logger.LogInformation("Database migrations completed successfully.");
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while running database migrations.");
            
            // Don't fail the application startup for migration errors in development
            if (!app.Environment.IsDevelopment())
            {
                throw;
            }
            
            logger.LogWarning("Continuing application startup despite migration errors (Development mode).");
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Enable Swagger middleware and UI
app.UseSwagger();
app.UseSwaggerUI();

// Apply CORS before endpoints
app.UseCors(DevCorsPolicy);

// Redirect root to Swagger UI for a friendly landing page
app.MapGet("/", () => Results.Redirect("/swagger"));

// Auth endpoints
app.MapAuthEndpoints();
//Product End points
app.MapProductEndpoints();

// Category endpoints
app.MapCategoryEndpoints();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

// Make Program class accessible to test project
public partial class Program { }
