using Microsoft.AspNetCore.Mvc;
using TheBlock.Api.Application;
using TheBlock.Api.Application.Interfaces;

namespace TheBlock.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }
        [HttpGet]
        public async Task<IActionResult> GetVehiclesAsync()
        {
            var result = await _vehicleService.GetVehiclesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehiclesByIdAsync(Guid id)
        {
            var result = await _vehicleService.GetVehicleByIdAsync(id);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost("{id}/bid")]
        public async Task<IActionResult> PlaceBidAsync(Guid id, [FromBody] PlaceBidRequest request)
        {
            var result = await _vehicleService.PlaceBidAsync(id, request.BidderName, request.Amount);
            if (result.Success == false)
            {
            return BadRequest(result);
            }
            return Ok(result);
        }
    }
}