using TheBlock.Api.Domain;
using TheBlock.Api.Application;

namespace TheBlock.Api.Application.Interfaces
{
    public interface IVehicleService
    {
        Task<List<Vehicle>> GetVehiclesAsync();
        Task<Vehicle?> GetVehicleByIdAsync(Guid id);
        Task<BidResult> PlaceBidAsync(Guid vehicleId, string bidderName, decimal amount);
    }
}