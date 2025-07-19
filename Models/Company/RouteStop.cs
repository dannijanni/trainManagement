using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class RouteStop
{
    public int RouteId { get; set; }

    public int StationId { get; set; }

    public int StopOrder { get; set; }

    public TimeOnly? ArrivalTime { get; set; }

    public TimeOnly? DepartureTime { get; set; }

    public virtual Route Route { get; set; } = null!;

    public virtual Station Station { get; set; } = null!;
}
