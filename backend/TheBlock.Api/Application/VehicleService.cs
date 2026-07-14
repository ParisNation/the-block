using Microsoft.EntityFrameworkCore;
using TheBlock.Api.Application.Interfaces;
using TheBlock.Api.Domain;
using TheBlock.Api.Infrastructure;

namespace TheBlock.Api.Application
{
    public class VehicleService : IVehicleService
    {
        private readonly TheBlockDbContext _context;
        public VehicleService(TheBlockDbContext context)
        {
            _context = context;
        }
        public async Task<List<Vehicle>> GetVehiclesAsync()
        {
            return await _context.Vehicles.ToListAsync();
        }

        public async Task<Vehicle?> GetVehicleByIdAsync(Guid id)
        {
            return await _context.Vehicles
            .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<BidResult> PlaceBidAsync(Guid vehicleId, string bidderName, decimal amount)
        {
            var vehicle = await GetVehicleByIdAsync(vehicleId);
            if (vehicle == null)
            {
                return new BidResult 
                {
                    Success = false,
                    Message = "Vehicle not found.",
                    CurrentBid = null
                };
            }
            var effectivePrice = vehicle.CurrentBid ?? vehicle.StartingBid;
            if (amount < effectivePrice )
            {
                return new BidResult
                {
                    Success = false,
                    Message = "This price is lower than the starting bid",
                    CurrentBid = amount
                };
            } else
            {
                vehicle.CurrentBid = amount;
                vehicle.BidCount++;
                await _context.SaveChangesAsync();

                return new BidResult
                {
                    Success = true,
                    Message = "Bid placed successfully.",
                    CurrentBid = amount
                };
            }
        }  
    }
}