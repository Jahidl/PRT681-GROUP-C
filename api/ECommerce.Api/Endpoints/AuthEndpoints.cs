using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

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

            group.MapPost("/login", async ([FromBody] LoginRequest request, AppDbContext db, IConfiguration config) =>
            {
                if (request == null)
                {
                    return Results.BadRequest(new { message = "Invalid request" });
                }

                var email = request.EmailAddress.Trim().ToLowerInvariant();
                var user = await db.Users.SingleOrDefaultAsync(u => u.EmailAddress.ToLower() == email);
                if (user == null)
                {
                    return Results.Unauthorized();
                }

                if (!VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Results.Unauthorized();
                }

                var token = GenerateJwtToken(user, config);
                user.LastLoginAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    accessToken = token,
                    user = new
                    {
                        user.Id,
                        user.FirstName,
                        user.LastName,
                        user.EmailAddress,
                        user.PhoneNumber
                    }
                });
            })
            .WithName("Login")
            .WithOpenApi();

            return routes;
        }

        private static string HashPassword(string password)
        {
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

        private static bool VerifyPassword(string password, string stored)
        {
            var parts = stored.Split(':');
            if (parts.Length != 2) return false;
            var salt = Convert.FromBase64String(parts[0]);
            var expectedHash = parts[1];

            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                100_000,
                HashAlgorithmName.SHA256,
                32);

            var actual = Convert.ToBase64String(hash);
            return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(actual), Encoding.UTF8.GetBytes(expectedHash));
        }

        private static string GenerateJwtToken(User user, IConfiguration config)
        {
            var issuer = config["JWT:Issuer"] ?? "cdu.local";
            var audience = config["JWT:Audience"] ?? "cdu.local";
            var key = config["JWT:Key"] ?? "supersecret_dev_key_change";

            // Ensure a minimum 256-bit key for HS256
            var keyBytes = Encoding.UTF8.GetBytes(key);
            if (keyBytes.Length < 32)
            {
                keyBytes = SHA256.HashData(keyBytes);
            }

            var securityKey = new SymmetricSecurityKey(keyBytes);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.EmailAddress),
                new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
                new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
