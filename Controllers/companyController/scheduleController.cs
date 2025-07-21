using Microsoft.AspNetCore.Mvc;

namespace train_management_system.Controllers.companyController
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
