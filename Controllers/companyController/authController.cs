using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;
using train_management_system.DTO;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class authController : ControllerBase
    {

        private readonly companyDAL _companyDAL;

        public authController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }


        [HttpPost("loginUser")]
        public IActionResult LoginUser([FromBody] authDTO.LoginUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = _companyDAL.AuthenticateUser(dto.Email, dto.Password);

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                return Ok(new
                {
                    message = "Login successful",
                    userId = user.UserId,
                    username = user.Username,
                    email = user.Email,
                    roleId = user.RoleId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login.", error = ex.Message });
            }
        }

    }
}
