using Microsoft.EntityFrameworkCore;
using TheBlock.Api.Domain;

namespace TheBlock.Api.Infrastructure;

public class TheBlockDbContext : DbContext
{
    public TheBlockDbContext(DbContextOptions<TheBlockDbContext> options) : base(options)
    {
    }

    public DbSet<Vehicle> Vehicles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vehicle>()
            .Property(v => v.AuctionStart)
            .HasColumnType("timestamp without time zone");
    }

}