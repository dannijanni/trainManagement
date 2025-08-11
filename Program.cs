using Microsoft.EntityFrameworkCore;
using train_management_system.DAL.Company;
using train_management_system.Models.Company;
using static train_management_system.DAL.Company.companyDAL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    });

builder.Services.AddAuthorization();

// Read DB connection info from environment variables (Railway)
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? ".";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "train_management";
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPass = Environment.GetEnvironmentVariable("DB_PASS");

// Build connection string
var envConnectionString =
    (!string.IsNullOrEmpty(dbUser) && !string.IsNullOrEmpty(dbPass))
    ? $"Server={dbServer}; Database={dbName}; User ID={dbUser}; Password={dbPass}; TrustServerCertificate=True;"
    : null;

// Use env var connection string if available, otherwise fallback to config
builder.Services.AddDbContext<CompanyContext>(options =>
{
    var connectionString = envConnectionString ??
                           AppConfiguration.ConnectionString ??
                           builder.Configuration.GetConnectionString("dbcs");

    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
});

// Configure CORS for development (allow all)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()    // For production, specify allowed origins instead
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddScoped<companyDAL>();

var app = builder.Build();

// Configure the HTTP request pipeline.
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
