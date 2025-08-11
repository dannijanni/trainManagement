using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using train_management_system.Models.Company;
using train_management_system.Utils;
using static train_management_system.DTO.bookingDTO;
using static train_management_system.DTO.driverDTO;
using static train_management_system.DTO.routeDTO;
using static train_management_system.DTO.scheduleDTO;
using static train_management_system.DTO.trainDTO;
using static train_management_system.DTO.vehcialDTO;
using CompanyRoute = train_management_system.Models.Company.Route;
using RouteDTO = train_management_system.DTO.routeDTO.Route;


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

                // Remove related UserActivity entries first
                var userActivities = _companyDbContext.UserActivities
                                       .Where(ua => ua.UserId == userId);
                _companyDbContext.UserActivities.RemoveRange(userActivities);

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
                //1.Create Route
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

                //_companyDbContext.Routes.Add(route);
                //await _companyDbContext.SaveChangesAsync();

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
                    RouteId = route.Id,
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

        #region Route
        public async Task<Guid> AddRouteAsync(AddRouteRequest request)
        {
            var route = new train_management_system.Models.Company.Route
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                RouteFrom = request.From,
                RouteTo = request.To,
                Distance = request.Distance,
                EstimatedDuration = request.EstimatedDuration,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _companyDbContext.Routes.Add(route);
            await _companyDbContext.SaveChangesAsync();

            foreach (var via in request.Via)
            {
                _companyDbContext.RouteVia.Add(new RouteVium
                {
                    RouteId = route.Id,
                    Via = via
                });
            }

            foreach (var kvp in request.Pricing)
            {
                _companyDbContext.RoutePricings.Add(new RoutePricing
                {
                    RouteId = route.Id,
                    ClassName = kvp.Key,
                    Price = kvp.Value
                });
            }

            await _companyDbContext.SaveChangesAsync();
            return route.Id;
        }

        public async Task<List<train_management_system.Models.Company.Route>> GetAllRoutesAsync()
        {
            return await _companyDbContext.Routes
                .Include(r => r.RouteVia)
                .Include(r => r.RoutePricings)
                .ToListAsync();
        }

        public async Task<bool> UpdateRouteAsync(UpdateRouteRequest request)
        {
            var route = await _companyDbContext.Routes
                .Include(r => r.RouteVia)
                .Include(r => r.RoutePricings)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            if (route == null)
                return false;

            route.Name = request.Name;
            route.RouteFrom = request.From;
            route.RouteTo = request.To;
            route.Distance = request.Distance;
            route.EstimatedDuration = request.EstimatedDuration;
            route.IsActive = request.IsActive;
            route.UpdatedAt = DateTime.UtcNow;

            // Replace VIA
            _companyDbContext.RouteVia.RemoveRange(route.RouteVia);
            foreach (var via in request.Via)
            {
                _companyDbContext.RouteVia.Add(new RouteVium
                {
                    RouteId = route.Id,
                    Via = via
                });
            }

            // Replace Pricing
            _companyDbContext.RoutePricings.RemoveRange(route.RoutePricings);
            foreach (var kvp in request.Pricing)
            {
                _companyDbContext.RoutePricings.Add(new RoutePricing
                {
                    RouteId = route.Id,
                    ClassName = kvp.Key,
                    Price = kvp.Value
                });
            }

            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRouteAsync(Guid id)
        {
            var route = await _companyDbContext.Routes
                .Include(r => r.RouteVia)
                .Include(r => r.RoutePricings)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (route == null) return false;

            _companyDbContext.RouteVia.RemoveRange(route.RouteVia);
            _companyDbContext.RoutePricings.RemoveRange(route.RoutePricings);
            _companyDbContext.Routes.Remove(route);

            await _companyDbContext.SaveChangesAsync();
            return true;
        }


        #endregion

        #region Schedule
        public async Task<Guid> AddScheduleAsync(AddScheduleRequest request)
        {
            var schedule = new Schedule
            {
                Id = Guid.NewGuid(),
                RouteId = request.RouteId,
                TrainId = request.TrainId,
                DriverId = request.DriverId,
                DepartureTime = TimeOnly.Parse(request.DepartureTime),
                ArrivalTime = TimeOnly.Parse(request.ArrivalTime),
                Date = DateOnly.Parse(request.Date),
                Frequency = request.Frequency,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _companyDbContext.Schedules.Add(schedule);
            await _companyDbContext.SaveChangesAsync();

            return schedule.Id;
        }

        public async Task<bool> UpdateScheduleAsync(UpdateScheduleRequest request)
        {
            var schedule = await _companyDbContext.Schedules.FindAsync(request.Id);
            if (schedule == null) return false;

            schedule.RouteId = request.RouteId;
            schedule.TrainId = request.TrainId;
            schedule.DriverId = request.DriverId;
            schedule.DepartureTime = TimeOnly.Parse(request.DepartureTime);
            schedule.ArrivalTime = TimeOnly.Parse(request.ArrivalTime);
            schedule.Date = DateOnly.Parse(request.Date);
            schedule.Frequency = request.Frequency;
            schedule.Status = request.Status;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Schedule>> GetAllSchedulesAsync()
        {
            return await _companyDbContext.Schedules
                .Include(s => s.Route)
                .Include(s => s.Train)
                .ToListAsync();
        }

        public async Task<bool> DeleteScheduleAsync(Guid id)
        {
            var schedule = await _companyDbContext.Schedules.FindAsync(id);
            if (schedule == null) return false;

            _companyDbContext.Schedules.Remove(schedule);
            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Vehical
        public async Task<Guid> AddVehicleAsync(AddVehicleRequest request)
        {
            var vehicle = new Vehicle
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                Capacity = request.Capacity,
                Status = request.Status,
                RegistrationNumber = request.RegistrationNumber,
                Manufacturer = request.Manufacturer,
                Model = request.Model,
                YearOfManufacture = request.YearOfManufacture,
                LastMaintenance = string.IsNullOrEmpty(request.LastMaintenance) ? null : DateTime.Parse(request.LastMaintenance),
                NextMaintenance = string.IsNullOrEmpty(request.NextMaintenance) ? null : DateTime.Parse(request.NextMaintenance),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _companyDbContext.Vehicles.Add(vehicle);
            await _companyDbContext.SaveChangesAsync();
            return vehicle.Id;
        }

        public async Task<List<Vehicle>> GetAllVehiclesAsync()
        {
            return await _companyDbContext.Vehicles.ToListAsync();
        }

        public async Task<bool> UpdateVehicleAsync(UpdateVehicleRequest request)
        {
            var vehicle = await _companyDbContext.Vehicles.FindAsync(request.Id);
            if (vehicle == null) return false;

            vehicle.Name = request.Name;
            vehicle.Type = request.Type;
            vehicle.Capacity = request.Capacity;
            vehicle.Status = request.Status;
            vehicle.RegistrationNumber = request.RegistrationNumber;
            vehicle.Manufacturer = request.Manufacturer;
            vehicle.Model = request.Model;
            vehicle.YearOfManufacture = request.YearOfManufacture;
            vehicle.LastMaintenance = string.IsNullOrEmpty(request.LastMaintenance) ? null : DateTime.Parse(request.LastMaintenance);
            vehicle.NextMaintenance = string.IsNullOrEmpty(request.NextMaintenance) ? null : DateTime.Parse(request.NextMaintenance);
            vehicle.UpdatedAt = DateTime.UtcNow;

            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteVehicleAsync(Guid id)
        {
            var vehicle = await _companyDbContext.Vehicles.FindAsync(id);
            if (vehicle == null) return false;

            _companyDbContext.Vehicles.Remove(vehicle);
            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Driver
        public async Task<Guid> AddDriverAsync(AddDriverRequest request)
        {
            var driver = new Driver
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                LicenseNumber = request.LicenseNumber,
                LicenseExpiry = DateOnly.Parse(request.LicenseExpiry),
                Status = request.Status,
                Experience = request.Experience,
                Rating = request.Rating,
                TotalTrips = request.TotalTrips,
                Availability = request.Availability,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _companyDbContext.Drivers.Add(driver);
            await _companyDbContext.SaveChangesAsync();
            return driver.Id;
        }

        public async Task<bool> UpdateDriverAsync(UpdateDriverRequest request)
        {
            var driver = await _companyDbContext.Drivers.FindAsync(request.Id);
            if (driver == null) return false;

            driver.FirstName = request.FirstName;
            driver.LastName = request.LastName;
            driver.Email = request.Email;
            driver.Phone = request.Phone;
            driver.LicenseNumber = request.LicenseNumber;
            driver.LicenseExpiry = DateOnly.Parse(request.LicenseExpiry);
            driver.Status = request.Status;
            driver.Experience = request.Experience;
            driver.Rating = request.Rating;
            driver.TotalTrips = request.TotalTrips;
            driver.Availability = request.Availability;
            driver.UpdatedAt = DateTime.UtcNow;

            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Driver>> GetAllDriversAsync()
        {
            return await _companyDbContext.Drivers.ToListAsync();
        }

        public async Task<bool> DeleteDriverAsync(Guid id)
        {
            var driver = await _companyDbContext.Drivers.FindAsync(id);
            if (driver == null) return false;

            _companyDbContext.Drivers.Remove(driver);
            await _companyDbContext.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Bookinng
        public async Task<Guid> CreateBookingAsync(CreateBookingRequest request)
        {
            // Parse BookingDate safely
            if (!DateTime.TryParse(request.BookingDate, out var bookingDate))
                throw new ArgumentException("Invalid or missing booking date.");

            // Parse TravelDate safely
            if (!DateOnly.TryParse(request.TravelDate, out var travelDate))
                throw new ArgumentException("Invalid or missing travel date.");

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                TrainId = request.TrainId,
                UserId = request.UserId,
                TotalAmount = request.TotalAmount,
                Status = request.Status,
                PaymentStatus = request.PaymentStatus,
                PaymentMethod = request.PaymentMethod,
                PaymentId = request.PaymentId,
                BookingDate = bookingDate,
                TravelDate = travelDate,
                Qrcode = request.QrCode,
                CreatedBy = string.IsNullOrWhiteSpace(request.CreatedBy) ? null : Guid.Parse(request.CreatedBy),
                Notes = request.Notes,
                SpecialBookingCode = request.SpecialBookingCode,
                IsAdminBooking = request.IsAdminBooking,
                RefundStatus = "pending",
                BookingSeats = request.Seats.Select(seat => new BookingSeat
                {
                    Class = seat.Class,
                    SeatNumber = seat.SeatNumber,
                    Price = seat.Price
                }).ToList(),
                Passengers = request.PassengerDetails.Select(p => new Passenger
                {
                    Name = p.Name,
                    Age = p.Age,
                    Gender = p.Gender,
                    Email = p.Email,
                    Phone = p.Phone
                }).ToList()
            };

            // Handle cash collection if payment is manual
            if (request.PaymentMethod == "manual" && request.PaymentDetails != null)
            {
                var cashCollection = new CashCollection
                {
                    Id = Guid.NewGuid(),
                    Date = DateOnly.FromDateTime(DateTime.Now),
                    CashierName = request.PaymentDetails.CashierName,
                    CounterLocation = request.PaymentDetails.CounterLocation,
                    TotalAmount = request.TotalAmount,
                    StartTime = TimeOnly.FromDateTime(DateTime.Now),
                    Notes = request.PaymentDetails.DeferralReason
                };

                var cashBooking = new CashCollectionBooking
                {
                    BookingId = booking.Id,
                    CashCollectionId = cashCollection.Id
                };

                booking.CashCollectionBookings.Add(cashBooking);
                _companyDbContext.CashCollections.Add(cashCollection);
            }

            _companyDbContext.Bookings.Add(booking);
            await _companyDbContext.SaveChangesAsync();
            return booking.Id;
        }


        public async Task<Booking?> GetBookingByIdAsync(Guid bookingId)
        {
            return await _companyDbContext.Bookings
                .Include(b => b.BookingSeats)
                .Include(b => b.Passengers)
                .Include(b => b.Payments)
                .Include(b => b.CashCollectionBookings)
                    .ThenInclude(ccb => ccb.CashCollection)
                .FirstOrDefaultAsync(b => b.Id == bookingId);
        }

        public async Task<List<Booking>> GetAllBookingsAsync()
        {
            return await _companyDbContext.Bookings
                .Include(b => b.BookingSeats)
                .Include(b => b.Passengers)
                .Include(b => b.Payments)
                .Include(b => b.CashCollectionBookings)
                    .ThenInclude(ccb => ccb.CashCollection)
                .ToListAsync();
        }

        public async Task<bool> CancelBookingAsync(Guid bookingId)
        {
            var booking = await _companyDbContext.Bookings
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                return false;

            booking.Status = "cancelled";
            booking.CancellationDate = DateTime.UtcNow;
            booking.RefundStatus = "pending";
            booking.RefundAmount = booking.TotalAmount; // optional, adjust refund policy
            booking.RefundProcessedBy = "system"; // or from context if admin/user info is available

            await _companyDbContext.SaveChangesAsync();
            return true;
        }


        #endregion

        #region Payment
        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            payment.Id = Guid.NewGuid();
            payment.PaymentDate = DateTime.UtcNow;

            _companyDbContext.Payments.Add(payment);
            await _companyDbContext.SaveChangesAsync();

            return payment;
        }




        public async Task<List<Payment>> GetPaymentsByBookingIdAsync(Guid bookingId)
        {
            return await _companyDbContext.Payments
                .Where(p => p.BookingId == bookingId)
                .ToListAsync();
        }

        public async Task<CashCollection> CreateCashCollectionAsync(CashCollection collection, List<Guid> bookingIds)
        {
            collection.Id = Guid.NewGuid();
            _companyDbContext.CashCollections.Add(collection);

            foreach (var bookingId in bookingIds)
            {
                _companyDbContext.CashCollectionBookings.Add(new CashCollectionBooking
                {
                    BookingId = bookingId,
                    CashCollectionId = collection.Id
                });
            }

            await _companyDbContext.SaveChangesAsync();
            return collection;
        }

        public async Task<CashCollection?> GetCashCollectionByIdAsync(Guid id)
        {
            return await _companyDbContext.CashCollections
                .Include(cc => cc.CashCollectionBookings)
                    .ThenInclude(ccb => ccb.Booking)
                .FirstOrDefaultAsync(cc => cc.Id == id);
        }

        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            return await _companyDbContext.Payments.ToListAsync();
        }

        public async Task<List<CashCollection>> GetAllCashCollectionsAsync()
        {
            return await _companyDbContext.CashCollections
                .Include(cc => cc.CashCollectionBookings)
                .ToListAsync();
        }



        #endregion

        #region System
        public async Task<SystemSetting?> GetAsync() =>
        await _companyDbContext.Set<SystemSetting>().FirstOrDefaultAsync();

        public async Task SaveAsync(SystemSetting setting)
        {
            var existing = await GetAsync();
            if (existing != null)
            {
                _companyDbContext.Entry(existing).CurrentValues.SetValues(setting);
            }
            else
            {
                _companyDbContext.Set<SystemSetting>().Add(setting);
            }
            await _companyDbContext.SaveChangesAsync();
        }
        #endregion

        #region User Activity
        public async Task<IEnumerable<UserActivity>> GetAllAsync() =>
        await _companyDbContext.Set<UserActivity>().ToListAsync();

        public async Task<UserActivity?> GetByIdAsync(Guid id) =>
            await _companyDbContext.Set<UserActivity>().FindAsync(id);

        public async Task AddAsync(UserActivity activity)
        {
            _companyDbContext.Set<UserActivity>().Add(activity);
            await _companyDbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var activity = await GetByIdAsync(id);
            if (activity != null)
            {
                _companyDbContext.Set<UserActivity>().Remove(activity);
                await _companyDbContext.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<UserActivity>> GetByUserIdAsync(Guid userId)
        {
            return await _companyDbContext.Set<UserActivity>()
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task LogAsync(Guid userId, string action, string details, string? ipAddress = null)
        {
            var activity = new UserActivity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Action = action,
                Details = details,
                Timestamp = DateTime.UtcNow,
                IpAddress = ipAddress
            };

            await _companyDbContext.AddAsync(activity);
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