using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Route
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string RouteFrom { get; set; } = null!;

    public string RouteTo { get; set; } = null!;

    public double Distance { get; set; }

    public string? EstimatedDuration { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<RoutePricing> RoutePricings { get; set; } = new List<RoutePricing>();

    public virtual ICollection<RouteVium> RouteVia { get; set; } = new List<RouteVium>();

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
