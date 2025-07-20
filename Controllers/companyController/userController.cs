using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using train_management_system.DAL.Company;
using train_management_system.DTO;
using train_management_system.Models.Company;
using train_management_system.Utils;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class userController : ControllerBase
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
                    UserId = Guid.NewGuid(), // Ensure GUID is generated here
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = Convert.ToBase64String(PasswordHelper.HashPassword(dto.Password)),
                    RoleId = dto.RoleId,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Phone = dto.Phone,
                    Department = dto.Department,
                    EmployeeId = dto.EmployeeId,
                    // CreatedAt and IsActive set in DAL
                };

                _companyDAL.SaveUser(newUser);
                return Ok(new { message = "User created successfully", userId = newUser.UserId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        //UPdate User
        [HttpPut("updateUser")]
        public IActionResult UpdateUser([FromQuery] Guid id, [FromBody] userDTO.UpdateUserDto dto)
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
                    PasswordHash = Convert.ToBase64String(PasswordHelper.HashPassword(dto.Password)),
                    RoleId = dto.RoleId,
                    IsActive = dto.IsActive,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Phone = dto.Phone,
                    Department = dto.Department,
                    EmployeeId = dto.EmployeeId
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
        public IActionResult DeleteUser(Guid id)
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

        [HttpGet("getUserByEmail")]
        public IActionResult GetUserByEmail([FromQuery] string email)
        {
            try
            {
                var user = _companyDAL.getUserIDbyEmail(email);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        //Get User By Id
        [HttpGet("getUserById")]
        public IActionResult GetUserById([FromQuery] Guid id)
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
