using System.Security.Cryptography;
using System.Text;
using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Endpoints
{
    public static class AuthEndpoints
    {
        public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/auth");

            group.MapPost("/register", async ([FromBody] RegisterRequest request, AppDbContext db) =>
            {
                if (request == null)
                {
                    return Results.BadRequest(new { message = "Invalid request" });
                }

                // Basic extra validation
                if (request.Password != request.ConfirmPassword)
                {
                    return Results.BadRequest(new { message = "Passwords do not match" });
                }

                var normalizedEmail = request.EmailAddress.Trim().ToLowerInvariant();

                var exists = await db.Users.AnyAsync(u => u.EmailAddress.ToLower() == normalizedEmail);
                if (exists)
                {
                    return Results.Conflict(new { message = "Email already registered" });
                }

                var user = new User
                {
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
                    EmailAddress = normalizedEmail,
                    PasswordHash = HashPassword(request.Password)
                };

                db.Users.Add(user);
                await db.SaveChangesAsync();

                return Results.Created($"/api/users/{user.Id}", new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.EmailAddress,
                    user.CreatedAtUtc
                });
            })
            .WithName("Register")
            .WithOpenApi();

            return routes;
        }

        private static string HashPassword(string password)
        {
            // PBKDF2 with random salt
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[16];
            rng.GetBytes(salt);

            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                100_000,
                HashAlgorithmName.SHA256,
                32);

            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }
    }
}
