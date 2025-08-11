using Microsoft.EntityFrameworkCore;
using train_management_system.DAL.Company;
using train_management_system.Models.Company;
using static train_management_system.DAL.Company.companyDAL;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    });

builder.Services.AddAuthorization();

// Build connection string from environment variables
string dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? ".";
string dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "train_management";
string dbUser = Environment.GetEnvironmentVariable("DB_USER");
string dbPass = Environment.GetEnvironmentVariable("DB_PASS");

string envConnectionString = (!string.IsNullOrEmpty(dbUser) && !string.IsNullOrEmpty(dbPass))
    ? $"Server={dbServer}; Database={dbName}; User ID={dbUser}; Password={dbPass}; TrustServerCertificate=True;"
    : null;

// Register DbContext
builder.Services.AddDbContext<CompanyContext>(options =>
{
    var connectionString = envConnectionString ??
                           builder.Configuration.GetConnectionString("dbcs");

    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
});

// CORS setup
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddScoped<companyDAL>();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("DevCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
