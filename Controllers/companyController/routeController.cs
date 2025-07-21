using Microsoft.AspNetCore.Mvc;
using static train_management_system.DTO.routeDTO;
using train_management_system.DAL.Company;

namespace train_management_system.Controllers.companyController
{
    [Route("api/[controller]")]
    [ApiController]
    public class routeController : ControllerBase
    {
        private readonly companyDAL _companyDAL;

        public routeController(companyDAL companyDAL)
        {
            _companyDAL = companyDAL;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddRoute([FromBody] AddRouteRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _companyDAL.AddRouteAsync(request);
            return Ok(new { message = "Route added successfully", routeId = id });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateRoute([FromBody] UpdateRouteRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _companyDAL.UpdateRouteAsync(request);
            if (!result) return NotFound("Route not found");

            return Ok(new { message = "Route updated successfully" });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetRoutes()
        {
            var routes = await _companyDAL.GetAllRoutesAsync();
            return Ok(routes.Select(r => new
            {
                id = r.Id,
                name = r.Name,
                from = r.RouteFrom,
                to = r.RouteTo,
                via = r.RouteVia.Select(v => v.Via).ToList(),
                distance = r.Distance,
                estimatedDuration = r.EstimatedDuration,
                isActive = r.IsActive,
                pricing = r.RoutePricings.ToDictionary(p => p.ClassName!, p => p.Price ?? 0),
                createdAt = r.CreatedAt,
                updatedAt = r.UpdatedAt
            }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(Guid id)
        {
            var result = await _companyDAL.DeleteRouteAsync(id);
            if (!result) return NotFound("Route not found");

            return Ok(new { message = "Route deleted successfully" });
        }

    }
}
