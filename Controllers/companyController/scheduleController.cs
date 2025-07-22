using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using static train_management_system.DTO.scheduleDTO;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class scheduleController : Controller
    {
        private readonly companyDAL _companyDAL;

        public scheduleController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddSchedule([FromBody] AddScheduleRequest request)
        {
            var id = await _companyDAL.AddScheduleAsync(request);
            return Ok(new { message = "Schedule added successfully", scheduleId = id });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateSchedule([FromBody] UpdateScheduleRequest request)
        {
            var success = await _companyDAL.UpdateScheduleAsync(request);
            if (!success) return NotFound("Schedule not found");

            return Ok(new { message = "Schedule updated successfully" });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetSchedules()
        {
            var schedules = await _companyDAL.GetAllSchedulesAsync();
            return Ok(schedules.Select(s => new
            {
                id = s.Id,
                routeId = s.RouteId,
                trainId = s.TrainId,
                driverId = s.DriverId,
                departureTime = s.DepartureTime.ToString("HH:mm"),
                arrivalTime = s.ArrivalTime.ToString("HH:mm"),
                date = s.Date.ToString("yyyy-MM-dd"),
                frequency = s.Frequency,
                status = s.Status,
                createdAt = s.CreatedAt.ToString("o"),
                updatedAt = s.UpdatedAt.ToString("o")
            }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(Guid id)
        {
            var success = await _companyDAL.DeleteScheduleAsync(id);
            if (!success) return NotFound("Schedule not found");

            return Ok(new { message = "Schedule deleted successfully" });
        }

    }
}
