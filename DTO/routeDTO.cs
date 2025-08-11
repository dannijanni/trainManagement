namespace train_management_system.DTO
{
    public class routeDTO
    {
        public class Route
        {
            public Guid Id { get; set; }
            public string From { get; set; } = string.Empty;
            public string To { get; set; } = string.Empty;
            public List<string> Via { get; set; } = new(); // or 1-to-many RouteVia table
        }

        public class AddRouteRequest
        {
            public string Name { get; set; } = string.Empty;
            public string From { get; set; } = string.Empty;
            public string To { get; set; } = string.Empty;
            public List<string> Via { get; set; } = new();
            public double Distance { get; set; }
            public string EstimatedDuration { get; set; } = string.Empty;
            public bool IsActive { get; set; } = true;
            public Dictionary<string, decimal> Pricing { get; set; } = new();
        }

        public class UpdateRouteRequest : AddRouteRequest
        {
            public Guid Id { get; set; }
        }

    }
}
