using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using train_management_system.Models.Company;

namespace train_management_system.Controllers.companyController
{
    [ApiController]
    [Route("api/[controller]")]
    public class userActivityController : ControllerBase
    {
        private readonly companyDAL _companyDAL;
        public userActivityController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
       Ok(await _companyDAL.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var result = await _companyDAL.GetByIdAsync(id);
            return result != null ? Ok(result) : NotFound();
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId) =>
            Ok(await _companyDAL.GetByUserIdAsync(userId));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserActivity activity)
        {
            activity.Timestamp ??= DateTime.UtcNow;
            await _companyDAL.AddAsync(activity);
            return Ok("Logged");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _companyDAL.DeleteAsync(id);
            return NoContent();
        }
    }
}
