using Microsoft.EntityFrameworkCore;
using ECommerce.OrdersApi.Models;

namespace ECommerce.OrdersApi;

public class AppDbContext(DbContextOptions<AppDbContext> opts) : DbContext(opts)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Order>().HasMany(o => o.Lines).WithOne().OnDelete(DeleteBehavior.Cascade);
    }
}
