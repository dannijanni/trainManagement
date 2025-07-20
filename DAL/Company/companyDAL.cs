using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using train_management_system.Models.Company;
using train_management_system.Utils;
using static train_management_system.DTO.trainDTO;

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

        #region Train

        public async Task<Guid> AddTrainAsync(AddTrainRequest request)
        {
            using var transaction = await _companyDbContext.Database.BeginTransactionAsync();

            try
            {
                // 1. Create Route
                var route = new train_management_system.Models.Company.Route
                {
                    Id = Guid.NewGuid(),
                    Name = $"{request.RouteFrom} - {request.RouteTo}", // Required
                    RouteFrom = request.RouteFrom,                     // Required
                    RouteTo = request.RouteTo,                         // Required
                    Distance = 0,                                      // Can replace with actual distance logic
                    EstimatedDuration = request.Duration,
                    IsActive = true,                                   // Required
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _companyDbContext.Routes.Add(route);
                await _companyDbContext.SaveChangesAsync();

                // 2. Create Train
                var train = new Train
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Number = request.Number,
                    RouteFrom = request.RouteFrom,
                    RouteTo = request.RouteTo,
                    Status = request.Status,
                    VehicleId = request.VehicleId,
                    DriverId = request.DriverId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                _companyDbContext.Trains.Add(train);
                await _companyDbContext.SaveChangesAsync();

                // 3. Add RouteVia
                foreach (var via in request.Via)
                {
                    _companyDbContext.TrainRouteVia.Add(new TrainRouteVium
                    {
                        TrainId = train.Id,
                        Via = via
                    });
                }

                // 4. Add TrainClasses
                foreach (var kvp in request.Classes)
                {
                    _companyDbContext.TrainClasses.Add(new TrainClass
                    {
                        TrainId = train.Id,
                        ClassName = kvp.Key,
                        TotalSeats = kvp.Value.TotalSeats,
                        AvailableSeats = kvp.Value.AvailableSeats,
                        Price = kvp.Value.Price
                    });
                }

                // 5. Add Schedule with valid RouteId
                var schedule = new Schedule
                {
                    Id = Guid.NewGuid(),
                    TrainId = train.Id,
                    RouteId = route.Id, // ✅ correct FK now
                    DepartureTime = TimeOnly.Parse(request.DepartureTime),
                    ArrivalTime = TimeOnly.Parse(request.ArrivalTime),
                    Date = DateOnly.FromDateTime(DateTime.UtcNow),
                    Frequency = "one-time",
                    Status = "scheduled",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _companyDbContext.Schedules.Add(schedule);

                await _companyDbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return train.Id;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task UpdateTrainAsync(UpdateTrainRequest request)
        {
            using var transaction = await _companyDbContext.Database.BeginTransactionAsync();

            try
            {
                var train = await _companyDbContext.Trains.FindAsync(request.Id);
                if (train == null)
                    throw new Exception("Train not found.");

                // Update basic fields
                train.Name = request.Name;
                train.Number = request.Number;
                train.RouteFrom = request.RouteFrom;
                train.RouteTo = request.RouteTo;
                train.Status = request.Status;
                train.VehicleId = request.VehicleId;
                train.DriverId = request.DriverId;
                train.UpdatedAt = DateTime.UtcNow;

                // Delete and re-add RouteVia
                var existingVia = _companyDbContext.TrainRouteVia.Where(x => x.TrainId == train.Id);
                _companyDbContext.TrainRouteVia.RemoveRange(existingVia);

                foreach (var via in request.Via)
                {
                    _companyDbContext.TrainRouteVia.Add(new TrainRouteVium
                    {
                        TrainId = train.Id,
                        Via = via
                    });
                }

                // Delete and re-add TrainClasses
                var existingClasses = _companyDbContext.TrainClasses.Where(x => x.TrainId == train.Id);
                _companyDbContext.TrainClasses.RemoveRange(existingClasses);

                foreach (var kvp in request.Classes)
                {
                    _companyDbContext.TrainClasses.Add(new TrainClass
                    {
                        TrainId = train.Id,
                        ClassName = kvp.Key,
                        TotalSeats = kvp.Value.TotalSeats,
                        AvailableSeats = kvp.Value.AvailableSeats,
                        Price = kvp.Value.Price
                    });
                }

                // Update schedule
                var schedule = _companyDbContext.Schedules.FirstOrDefault(x => x.TrainId == train.Id);
                if (schedule != null)
                {
                    schedule.DepartureTime = TimeOnly.Parse(request.DepartureTime);
                    schedule.ArrivalTime = TimeOnly.Parse(request.ArrivalTime);
                    schedule.UpdatedAt = DateTime.UtcNow;
                }

                await _companyDbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteTrainAsync(Guid trainId)
        {
            using var transaction = await _companyDbContext.Database.BeginTransactionAsync();

            try
            {
                var train = await _companyDbContext.Trains.FindAsync(trainId);
                if (train == null)
                    throw new Exception("Train not found.");

                // Remove related data
                var vias = _companyDbContext.TrainRouteVia.Where(x => x.TrainId == trainId);
                var classes = _companyDbContext.TrainClasses.Where(x => x.TrainId == trainId);
                var schedule = _companyDbContext.Schedules.FirstOrDefault(x => x.TrainId == trainId);

                _companyDbContext.TrainRouteVia.RemoveRange(vias);
                _companyDbContext.TrainClasses.RemoveRange(classes);
                if (schedule != null)
                    _companyDbContext.Schedules.Remove(schedule);

                _companyDbContext.Trains.Remove(train);

                await _companyDbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Train?> GetTrainByIdAsync(Guid id)
        {
            return await _companyDbContext.Trains
                .Include(t => t.TrainRouteVia)
                .Include(t => t.TrainClasses)
                .Include(t => t.Schedules)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<Train>> GetAllTrainsAsync()
        {
            return await _companyDbContext.Trains
                .Include(t => t.TrainRouteVia)
                .Include(t => t.TrainClasses)
                .Include(t => t.Schedules)
                .ToListAsync();
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