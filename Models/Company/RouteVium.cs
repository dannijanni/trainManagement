using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class RouteVium
{
    public int Id { get; set; }

    public Guid RouteId { get; set; }

    public string? Via { get; set; }

    public virtual Route Route { get; set; } = null!;
}
