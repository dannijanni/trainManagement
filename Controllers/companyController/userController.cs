using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using train_management_system.DAL.Company;
using train_management_system.DTO;
using train_management_system.Models.Company;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class userController : Controller
    {
        private readonly companyDAL _companyDAL;

        public userController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("create")]
        public IActionResult CreateUser([FromBody] userDTO.CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var newUser = new User
                {
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = HashPassword(dto.Password),
                    RoleId = dto.RoleId,
                    // UserId and CreatedAt will be handled in DAL
                };

                _companyDAL.SaveUser(newUser);
                return Ok(new { message = "User created successfully", userId = newUser.UserId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        private byte[] HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
