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

        [HttpPost("createUser")]
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

        //Password Conversion
        private byte[] HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        //UPdate User
        [HttpPut("updateUser")]
        public IActionResult UpdateUser([FromQuery] int id, [FromBody] userDTO.UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedUser = new User
                {
                    UserId = id,
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = HashPassword(dto.Password),
                    RoleId = dto.RoleId,
                    IsActive = dto.IsActive
                };

                _companyDAL.UpdateUser(updatedUser);
                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        //Delete User
        [HttpDelete("deleteUser")]
        public IActionResult DeleteUser(int id)
        {
            try
            {
                _companyDAL.DeleteUser(id);
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        //Get All User
        [HttpGet("getAllUsers")]
        public IActionResult GetAllUsers()
        {
            try
            {
                var users = _companyDAL.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        //Get User By Id
        [HttpGet("getUserById")]
        public IActionResult GetUserById([FromQuery] int id)
        {
            try
            {
                var user = _companyDAL.GetUserById(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }
    }
}
