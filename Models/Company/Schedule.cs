using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Schedule
{
    public Guid Id { get; set; }

    public Guid RouteId { get; set; }

    public Guid TrainId { get; set; }

    public Guid? DriverId { get; set; }

    public TimeOnly DepartureTime { get; set; }

    public TimeOnly ArrivalTime { get; set; }

    public DateOnly Date { get; set; }

    public string? Frequency { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Route Route { get; set; } = null!;

    public virtual Train Train { get; set; } = null!;
}
