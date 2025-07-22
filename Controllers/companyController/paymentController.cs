using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using train_management_system.Models.Company;

namespace train_management_system.Controllers.companyController
{
    [ApiController]
    [Route("api/[controller]")]
    public class paymentController : ControllerBase
    {
        private readonly companyDAL _companyDAL;

        public paymentController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] Payment payment)
        {
            var result = await _companyDAL.CreatePaymentAsync(payment);
            return Ok(result);
        }

        [HttpGet("booking")]
        public async Task<IActionResult> GetPaymentsByBookingId([FromQuery] Guid bookingId)
        {
            var result = await _companyDAL.GetPaymentsByBookingIdAsync(bookingId);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPayments()
        {
            var result = await _companyDAL.GetAllPaymentsAsync();
            return Ok(result);
        }

    }
}
