using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Route
{
    public int RouteId { get; set; }

    public string RouteName { get; set; } = null!;

    public bool IsActive { get; set; }

    public virtual ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
