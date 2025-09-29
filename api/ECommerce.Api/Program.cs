using ECommerce.Api.Data;
using ECommerce.Api.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- OpenAPI / Swagger ---
builder.Services.AddOpenApi();            // .NET 9 minimal OpenAPI (optional)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CORS for Vite dev ports ---
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

// --- Connection string ---
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? "Server=sqlserver,1433;Database=sportappDb;User Id=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=True";

// --- EF Core DbContext (EF migrations only) ---
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

var app = builder.Build();

// --- Swagger ---
app.UseSwagger();
app.UseSwaggerUI();

// --- CORS early ---
app.UseCors(DevCorsPolicy);

// (Dev) keep HTTP to avoid http→https redirect loops with Vite
// if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();

// Accept CORS preflight for any API path
app.MapMethods("/api/{**any}", new[] { "OPTIONS" }, () => Results.Ok())
   .RequireCors(DevCorsPolicy);

// Friendly landing
app.MapGet("/", () => Results.Redirect("/swagger"));

// --- Minimal API endpoints ---
app.MapAuthEndpoints();      // existing
app.MapCategoryEndpoints();  // existing (not used by Products)
app.MapProductEndpoints();   // new

// Sample endpoint left as-is
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
