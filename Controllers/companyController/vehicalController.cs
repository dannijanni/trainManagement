using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using static train_management_system.DTO.vehcialDTO;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class vehicalController : ControllerBase
    {
        private readonly companyDAL _companyDAL;

        public vehicalController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddVehicle([FromBody] AddVehicleRequest request)
        {
            var id = await _companyDAL.AddVehicleAsync(request);
            return Ok(new { message = "Vehicle added successfully", vehicleId = id });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateVehicle([FromBody] UpdateVehicleRequest request)
        {
            var result = await _companyDAL.UpdateVehicleAsync(request);
            if (!result) return NotFound("Vehicle not found");
            return Ok(new { message = "Vehicle updated successfully" });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetVehicles()
        {
            var vehicles = await _companyDAL.GetAllVehiclesAsync();
            return Ok(vehicles.Select(v => new
            {
                id = v.Id,
                name = v.Name,
                type = v.Type,
                capacity = v.Capacity,
                status = v.Status,
                registrationNumber = v.RegistrationNumber,
                manufacturer = v.Manufacturer,
                model = v.Model,
                yearOfManufacture = v.YearOfManufacture,
                lastMaintenance = v.LastMaintenance?.ToString("o"),
                nextMaintenance = v.NextMaintenance?.ToString("o"),
                createdAt = v.CreatedAt?.ToString("o"),
                updatedAt = v.UpdatedAt?.ToString("o")
            }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(Guid id)
        {
            var result = await _companyDAL.DeleteVehicleAsync(id);
            if (!result) return NotFound("Vehicle not found");
            return Ok(new { message = "Vehicle deleted successfully" });
        }
    }
}
