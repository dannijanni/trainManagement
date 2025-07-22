using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using static train_management_system.DTO.driverDTO;

namespace train_management_system.Controllers.companyController
{
    [ApiController]
    [Route("api/[controller]")]
    public class driverController : ControllerBase
    {
        private readonly companyDAL _companyDAL;

        public driverController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddDriver([FromBody] AddDriverRequest request)
        {
            var id = await _companyDAL.AddDriverAsync(request);
            return Ok(new { message = "Driver added successfully", driverId = id });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateDriver([FromBody] UpdateDriverRequest request)
        {
            var result = await _companyDAL.UpdateDriverAsync(request);
            if (!result) return NotFound("Driver not found");

            return Ok(new { message = "Driver updated successfully" });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetDrivers()
        {
            var drivers = await _companyDAL.GetAllDriversAsync();
            return Ok(drivers.Select(d => new
            {
                id = d.Id,
                firstName = d.FirstName,
                lastName = d.LastName,
                email = d.Email,
                phone = d.Phone,
                licenseNumber = d.LicenseNumber,
                licenseExpiry = d.LicenseExpiry?.ToString("yyyy-MM-dd"),
                status = d.Status,
                experience = d.Experience ?? 0,
                rating = d.Rating ?? 0,
                totalTrips = d.TotalTrips ?? 0,
                availability = d.Availability,
                // Default or frontend-calculated data
                workHours = new { daily = 0, weekly = 0, monthly = 0 },
                assignedRoutes = new List<string>(),
                performance = new { onTimePercentage = 0, customerRating = 0, totalRatings = 0 },
                createdAt = d.CreatedAt?.ToString("o"),
                updatedAt = d.UpdatedAt?.ToString("o")
            }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDriver(Guid id)
        {
            var result = await _companyDAL.DeleteDriverAsync(id);
            if (!result) return NotFound("Driver not found");

            return Ok(new { message = "Driver deleted successfully" });
        }
    }
}
