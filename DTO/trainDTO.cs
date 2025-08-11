namespace train_management_system.DTO
{
    public class trainDTO
    {
        public class AddTrainRequest
        {
            //public Guid RouteId { get; set; } // ✅ New
            public string Name { get; set; } = string.Empty;
            public string Number { get; set; } = string.Empty;

            // Route
            public string RouteFrom { get; set; } = string.Empty;
            public string RouteTo { get; set; } = string.Empty;
            public List<string> Via { get; set; } = new(); // comma-split in frontend, parsed into list in backend

            // Schedule
            public string DepartureTime { get; set; } = string.Empty; // "HH:mm"
            public string ArrivalTime { get; set; } = string.Empty; // "HH:mm"
            public string Duration { get; set; } = string.Empty;

            // Classes: dynamic dictionary of class info (first, business, economy)
            public Dictionary<string, TrainClassRequest> Classes { get; set; } = new();

            // Other info
            public string Status { get; set; } = "active";
            public List<string> Amenities { get; set; } = new(); // if you store them

            public Guid? VehicleId { get; set; }
            public Guid? DriverId { get; set; }
        }

        public class TrainClassRequest
        {
            public int TotalSeats { get; set; }
            public int AvailableSeats { get; set; }
            public decimal Price { get; set; }
        }

        public class UpdateTrainRequest : AddTrainRequest
        {
            public Guid Id { get; set; }
        }

    }
}
