using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using train_management_system.Models.Company;

namespace train_management_system.DAL.Company
{
    public class companyDAL
    {
        private readonly CompanyContext _companyDbContext;
        private readonly string _baseConnectionString;
        public companyDAL(CompanyContext companyDbContext, IConfiguration configuration)
        {
            
            _companyDbContext = companyDbContext;
            _baseConnectionString = configuration.GetConnectionString("dbcs");
        }

        #region Common

        //Database Connection String
        private string BuildConnectionString(string databaseName)
        {
            string baseConnectionString = _baseConnectionString;

            if (string.IsNullOrWhiteSpace(baseConnectionString))
                throw new InvalidOperationException("Base connection string is missing in appsettings.json.");

            var builder = new SqlConnectionStringBuilder(baseConnectionString)
            {
                InitialCatalog = databaseName
            };

            return builder.ConnectionString;
        }


        public void SaveUser(User entity)
        {
            try
            {

                // Delete existing user by same Username or Email (if needed)
                var existingUser = _companyDbContext.Users
                    .FirstOrDefault(x => x.Username == entity.Username || x.Email == entity.Email);

                if (existingUser != null)
                {
                    _companyDbContext.Users.Remove(existingUser);
                    _companyDbContext.SaveChanges(); // Ensure delete before insert
                }

                // Set creation date and active status
                entity.CreatedAt = DateTime.UtcNow;
                entity.IsActive = true;

                // Insert new user
                _companyDbContext.Users.Add(entity);
                _companyDbContext.SaveChanges(); // Final save
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving the user.", ex);
            }
        }

        #endregion

        #region AppConfiguration
        public class AppConfiguration
        {
            public static string ConnectionString { get; set; } = string.Empty;
        }

        #endregion
    }
}