using Microsoft.EntityFrameworkCore;
using ECommerce.CatalogApi.Models;

namespace ECommerce.CatalogApi;

public class AppDbContext(DbContextOptions<AppDbContext> opts) : DbContext(opts)
{
    public DbSet<Product> Products => Set<Product>();
}