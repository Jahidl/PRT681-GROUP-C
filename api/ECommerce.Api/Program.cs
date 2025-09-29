using ECommerce.Api.Data;
using ECommerce.Api.Endpoints;
using Microsoft.EntityFrameworkCore;
using FluentMigrator.Runner;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI/Swagger
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ⭐ CHANGED: CORS policy that exactly allows your Vite dev ports (5173/5174/…)
// and supports credentials. Keep this list in sync with your frontend ports.
const string DevCorsPolicy = "DevCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                
                "http://localhost:5174",
                
                "http://localhost:5175",
                
                "http://localhost:5176"
                
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ⭐ CHANGED: default connection string set to the docker-compose service name `sqlserver`
// and your actual DB name `sportappDb`. Env/Config still take precedence.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? "Server=sqlserver,1433;Database=sportappDb;User Id=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=True";

// Only add DbContext/Migrator outside tests
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer(connectionString);
    });

    builder.Services
        .AddFluentMigratorCore()
        .ConfigureRunner(rb => rb
            .AddSqlServer()
            .WithGlobalConnectionString(connectionString)
            .ScanIn(Assembly.GetExecutingAssembly()).For.Migrations())
        .AddLogging(lb => lb.AddFluentMigratorConsole());
}

var app = builder.Build();

// Run migrations (skip during tests)
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    try
    {
        var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Starting database migrations...");
        runner.MigrateUp();
        logger.LogInformation("Database migrations completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while running database migrations.");
        if (!app.Environment.IsDevelopment())
            throw;

        logger.LogWarning("Continuing application startup despite migration errors (Development mode).");
    }
}

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// ⭐ CHANGED: Use CORS early, before mapping endpoints
app.UseCors(DevCorsPolicy);

// ⭐ CHANGED: (Dev) DO NOT force HTTPS redirection to avoid http→https redirects
// if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();

// ⭐ CHANGED: Accept preflight for any API path so browsers don't fail OPTIONS with 404.
// CORS middleware will add the right headers.
app.MapMethods("/api/{**any}", new[] { "OPTIONS" }, () => Results.Ok())
   .RequireCors(DevCorsPolicy);

// Friendly landing
app.MapGet("/", () => Results.Redirect("/swagger"));

// Minimal API endpoints
app.MapAuthEndpoints();       // /api/auth/register, /api/auth/login
app.MapCategoryEndpoints();   // your category endpoints

// Sample
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
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
