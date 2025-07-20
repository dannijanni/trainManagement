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

    }
}
