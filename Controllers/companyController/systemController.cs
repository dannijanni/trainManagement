using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using train_management_system.Models.Company;

namespace train_management_system.Controllers.companyController
{
    [ApiController]
    [Route("api/[controller]")]
    public class systemController : ControllerBase
    {
        private readonly companyDAL _companyDAL;
        public systemController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var setting = await _companyDAL.GetAsync();
            if (setting == null) return NotFound();

            // Mask sensitive info before sending
            setting.ApiKey = null;
            setting.SecretKey = null;

            return Ok(setting);
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] SystemSetting setting)
        {
            await _companyDAL.SaveAsync(setting);
            return Ok("Settings saved");
        }
    }
}
