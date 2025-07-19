using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Station
{
    public int StationId { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? City { get; set; }

    public string? State { get; set; }

    public virtual ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();
}
