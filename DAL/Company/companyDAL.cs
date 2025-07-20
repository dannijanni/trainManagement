using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using train_management_system.Models.Company;
using train_management_system.Utils;

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

        #region Auth
        public User? AuthenticateUser(string email, string password)
        {
            try
            {
                var user = _companyDbContext.Users.FirstOrDefault(u => u.Email == email);
                
                if (user == null)
                    return null;
                
                var hashedInput = Convert.ToBase64String(PasswordHelper.HashPassword(password));

                if (user.PasswordHash != hashedInput)
                    return null;

                user.LastLogin = DateTime.UtcNow;
                _companyDbContext.SaveChanges();

                return user;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while authenticating the user.", ex);
            }
        }

        #endregion

        #region User
        // Create New User
        public void SaveUser(User entity)
        {
            try
            {
                // Check if user with same username or email already exists
                var existingUser = _companyDbContext.Users
                    .FirstOrDefault(x => x.Username == entity.Username || x.Email == entity.Email);

                if (existingUser != null)
                {
                    throw new Exception("A user with the same username or email already exists.");
                }

                // Set additional fields
                entity.CreatedAt = DateTime.UtcNow;
                entity.IsActive = true;

                // Insert user
                _companyDbContext.Users.Add(entity);
                _companyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving the user.", ex);
            }
        }

        //Get User GUID through Email
        public User getUserIDbyEmail(string email)
        {
            try
            {
                return _companyDbContext.Users.FirstOrDefault(u => u.Email == email);
            }
            catch (Exception ex)
            {
                throw new Exception("User not found.", ex);
            }
        }

        //Upate User
        public void UpdateUser(User updatedUser)
        {
            try
            {
                var existingUser = _companyDbContext.Users.FirstOrDefault(x => x.UserId == updatedUser.UserId);

                if (existingUser == null)
                {
                    throw new Exception("User not found.");
                }

                // Update fields
                existingUser.Username = updatedUser.Username;
                existingUser.Email = updatedUser.Email;
                existingUser.PasswordHash = updatedUser.PasswordHash; // Include if password change is allowed
                existingUser.RoleId = updatedUser.RoleId;
                existingUser.IsActive = updatedUser.IsActive;
                existingUser.FirstName = updatedUser.FirstName;
                existingUser.LastName = updatedUser.LastName;
                existingUser.Phone = updatedUser.Phone;
                existingUser.Department = updatedUser.Department;
                existingUser.EmployeeId = updatedUser.EmployeeId;

                // Avoid touching CreatedAt here

                _companyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while updating the user.", ex);
            }
        }


        //Delete User
        public void DeleteUser(Guid userId)
        {
            try
            {
                var user = _companyDbContext.Users.FirstOrDefault(x => x.UserId == userId);

                if (user == null)
                {
                    throw new Exception("User not found.");
                }
                 
                _companyDbContext.Users.Remove(user);
                _companyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while deleting the user.", ex);
            }
        }

        //Get All User
        public List<User> GetAllUsers()
        {
            try
            {
                return _companyDbContext.Users.ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving users.", ex);
            }
        }

        //Get User By Id
        public User GetUserById(Guid userId)
        {
            try
            {
                var user = _companyDbContext.Users.FirstOrDefault(x => x.UserId == userId);

                if (user == null)
                {
                    throw new Exception("User not found.");
                }

                return user;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving the user.", ex);
            }
        }



        #endregion

        #region Role

        //Get All the Role
        public List<Role> GetAllRoles()
        {
            return _companyDbContext.Roles.ToList();
        }

        // Get role by ID
        public Role? GetRoleById(int id)
        {
            return _companyDbContext.Roles.FirstOrDefault(r => r.RoleId == id);
        }
        #endregion
        #endregion

        #region AppConfiguration
        public class AppConfiguration
        {
            public static string ConnectionString { get; set; } = string.Empty;
        }

        #endregion
    }
}