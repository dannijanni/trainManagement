using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Train
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Number { get; set; } = null!;

    public string RouteFrom { get; set; } = null!;

    public string RouteTo { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string Status { get; set; } = null!;

    public Guid? VehicleId { get; set; }

    public Guid? DriverId { get; set; }

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

    public virtual ICollection<TrainClass> TrainClasses { get; set; } = new List<TrainClass>();

    public virtual ICollection<TrainRouteVium> TrainRouteVia { get; set; } = new List<TrainRouteVium>();
}
