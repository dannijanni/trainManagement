using Microsoft.AspNetCore.Mvc;
using train_management_system.DAL.Company;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class roleController : ControllerBase
    {
        private readonly companyDAL _companyDAL;

        public roleController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpGet("getAll")]
        public IActionResult GetAllRoles()
        {
            try
            {
                var roles = _companyDAL.GetAllRoles()
                    .Select(r => new
                    {
                        r.RoleId,
                        r.RoleName
                    }).ToList();

                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving roles", error = ex.Message });
            }
        }

        // GET: api/role/getById/1
        [HttpGet("getById")]
        public IActionResult GetRoleById([FromQuery] int id)
        {
            try
            {
                var role = _companyDAL.GetRoleById(id);
                if (role == null)
                    return NotFound(new { message = "Role not found" });

                return Ok(new
                {
                    role.RoleId,
                    role.RoleName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving role", error = ex.Message });
            }
        }
    }
}
