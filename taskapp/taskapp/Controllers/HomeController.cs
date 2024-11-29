using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using YourNamespace;

namespace YourNamespace.Controllers
{
    public class HomeController : Controller
    {
        private readonly DatabaseHelper _databaseHelper;

        public HomeController(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            _databaseHelper = new DatabaseHelper(connectionString);
        }

        public IActionResult Index()
        {
            var query = "SELECT * FROM YourTable";
            var data = _databaseHelper.ExecuteQuery(query);
            return View(data);
        }
    }
}
