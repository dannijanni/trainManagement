using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using static train_management_system.DTO.bookingDTO;

namespace train_management_system.Controllers.companyController
{
    [ApiController]
    [Route("api/[controller]")]
    public class bookingController : Controller
    {
        private readonly companyDAL _companyDAL;

        public bookingController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            var id = await _companyDAL.CreateBookingAsync(request);
            return Ok(new { message = "Booking created", id });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(Guid id)
        {
            var booking = await _companyDAL.GetBookingByIdAsync(id); // you'll implement this
            if (booking == null) return NotFound("Booking not found");
            return Ok(booking);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(Guid id)
        {
            var success = await _companyDAL.CancelBookingAsync(id); // implement this
            return success ? Ok("Booking cancelled") : NotFound("Booking not found");
        }
    }
}