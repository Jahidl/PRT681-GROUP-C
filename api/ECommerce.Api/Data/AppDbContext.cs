using ECommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            

              modelBuilder.Entity<Product>().HasIndex(p => p.Name);
            modelBuilder.Entity<Product>().HasIndex(p => p.Price);

            // Use fixed timestamps so EF seeding generates deterministic code
            var seededAt = new DateTime(2025, 01, 01, 0, 0, 0, DateTimeKind.Utc);

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Clean Code", Description = "A Handbook of Agile Software Craftsmanship", Price = 49.99m, ImageUrl = "images/clean-code.jpg", Stock = 12, Sku = "BK-CLCODE-001", CreatedAtUtc = seededAt },
                new Product { Id = 2, Name = "The Pragmatic Programmer", Description = "Your Journey to Mastery (20th Anniversary)", Price = 54.50m, ImageUrl = "images/pragmatic-programmer.jpg", Stock = 8, Sku = "BK-PRAGMA-002", CreatedAtUtc = seededAt },
                new Product { Id = 3, Name = "Design Patterns", Description = "Elements of Reusable Object-Oriented Software", Price = 62.00m, ImageUrl = "images/design-patterns.jpg", Stock = 5, Sku = "BK-GOF-003", CreatedAtUtc = seededAt },
                new Product { Id = 4, Name = "Refactoring", Description = "Improving the Design of Existing Code", Price = 58.25m, ImageUrl = "images/refactoring.jpg", Stock = 10, Sku = "BK-REFACT-004", CreatedAtUtc = seededAt },
                new Product { Id = 5, Name = "Introduction to Algorithms", Description = "CLRS 4e", Price = 89.99m, ImageUrl = "images/clrs.jpg", Stock = 7, Sku = "BK-CLRS-005", CreatedAtUtc = seededAt },
                new Product { Id = 6, Name = "You Don't Know JS Yet", Description = "Get Started", Price = 24.99m, ImageUrl = "images/ydkjs.jpg", Stock = 20, Sku = "BK-YDKJS-006", CreatedAtUtc = seededAt }
            );

            // Schema is managed by FluentMigrator
            // EF Core is used only for data access
        }
    }
}
