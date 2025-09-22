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

            // Schema is managed by FluentMigrator
            // EF Core is used only for data access
        }
    }
}
