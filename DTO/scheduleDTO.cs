namespace train_management_system.DTO
{
    public class scheduleDTO
    {
        public class AddScheduleRequest
        {
            public Guid RouteId { get; set; }
            public Guid TrainId { get; set; }
            public Guid? DriverId { get; set; }

            public string DepartureTime { get; set; } = ""; // HH:mm
            public string ArrivalTime { get; set; } = "";   // HH:mm
            public string Date { get; set; } = "";          // yyyy-MM-dd

            public string Frequency { get; set; } = "one-time"; // daily, weekly, etc.
            public List<int>? DaysOfWeek { get; set; } // Optionally stored elsewhere
            public string Status { get; set; } = "scheduled";
        }

        public class UpdateScheduleRequest : AddScheduleRequest
        {
            public Guid Id { get; set; }
        }

    }
}
