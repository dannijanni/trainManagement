using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using train_management_system.DTO;
using train_management_system.Models.Company;

namespace train_management_system.Controllers.companyController
{
    [ApiController]
    [Route("api/[controller]")]
    public class cashCollectionController : ControllerBase
    {
        private readonly companyDAL _companyDAL;
        public cashCollectionController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateCashCollection([FromBody] cashCollectionDTO.CreateCashCollectionRequest request)
        {
            var collection = new CashCollection
            {
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                CashierName = request.CashierName,
                CounterLocation = request.CounterLocation,
                TotalAmount = request.TotalAmount,
                StartTime = TimeOnly.FromDateTime(DateTime.UtcNow),
                EndTime = TimeOnly.FromDateTime(DateTime.UtcNow.AddHours(1)),
                Notes = request.Notes
            };

            var result = await _companyDAL.CreateCashCollectionAsync(collection, request.BookingIds);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _companyDAL.GetCashCollectionByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _companyDAL.GetAllCashCollectionsAsync();
            return Ok(result);
        }
    }
}
