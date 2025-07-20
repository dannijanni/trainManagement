using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using static train_management_system.DTO.trainDTO;
using train_management_system.DAL_Interface;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class trainController : ControllerBase
    {
        private readonly companyDAL _companyDAL;

        public trainController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddTrain([FromBody] AddTrainRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var trainId = await _companyDAL.AddTrainAsync(request);
                return Ok(new { message = "Train added successfully", trainId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adding train", error = ex.Message });
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateTrain([FromBody] UpdateTrainRequest request)
        {
            try
            {
                await _companyDAL.UpdateTrainAsync(request);
                return Ok(new { message = "Train updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Update failed", error = ex.Message });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTrain([FromQuery] Guid id)
        {
            try
            {
                await _companyDAL.DeleteTrainAsync(id);
                return Ok(new { message = "Train deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Delete failed", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrainById(Guid id)
        {
            var train = await _companyDAL.GetTrainByIdAsync(id);
            if (train == null)
                return NotFound(new { message = "Train not found." });

            return Ok(train);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllTrains()
        {
            var trains = await _companyDAL.GetAllTrainsAsync();
            return Ok(trains);
        }

    }
}
