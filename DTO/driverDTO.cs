namespace train_management_system.DTO
{
    public class driverDTO
    {
        public class AddDriverRequest
        {
            public string FirstName { get; set; } = string.Empty;
            public string LastName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string LicenseNumber { get; set; } = string.Empty;
            public string LicenseExpiry { get; set; } = ""; // yyyy-MM-dd
            public string Status { get; set; } = "active";
            public int Experience { get; set; }
            public double Rating { get; set; }
            public int TotalTrips { get; set; }
            public string Availability { get; set; } = "available";
        }

        public class UpdateDriverRequest : AddDriverRequest
        {
            public Guid Id { get; set; }
        }

    }
}
