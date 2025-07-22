namespace train_management_system.DTO
{
    public class vehcialDTO
    {
        public class AddVehicleRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty; // "train", "bus", "metro"
            public int Capacity { get; set; }
            public string Status { get; set; } = "active"; // "active", "maintenance", etc.
            public string RegistrationNumber { get; set; } = string.Empty;
            public string Manufacturer { get; set; } = string.Empty;
            public string Model { get; set; } = string.Empty;
            public int YearOfManufacture { get; set; }
            public string? LastMaintenance { get; set; } // ISO format
            public string? NextMaintenance { get; set; }
        }

        public class UpdateVehicleRequest : AddVehicleRequest
        {
            public Guid Id { get; set; }
        }

    }
}
