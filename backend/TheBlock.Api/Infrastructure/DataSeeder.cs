using System.Text.Json;
using TheBlock.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace TheBlock.Api.Infrastructure
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(TheBlockDbContext context)
        {
            if (await context.Vehicles.AnyAsync())
            {
                return;
            }
            var jsonPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "data", "vehicles.json");
            string jsonContent = await File.ReadAllTextAsync(jsonPath);
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            };
            var vehicles = JsonSerializer.Deserialize<List<Vehicle>>(jsonContent, options);
            if (vehicles == null)
            {
                throw new Exception("Failed ot deserialize vehicles.json");
            }
            foreach (var vehicle in vehicles)
            {
                vehicle.AuctionStart = DateTime.SpecifyKind(vehicle.AuctionStart, DateTimeKind.Unspecified);
            }
            context.Vehicles.AddRange(vehicles);
            await context.SaveChangesAsync();
        }
    }
}