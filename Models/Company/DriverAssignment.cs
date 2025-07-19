using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class DriverAssignment
{
    public int AssignmentId { get; set; }

    public int DriverId { get; set; }

    public int ScheduleId { get; set; }

    public DateTime AssignedAt { get; set; }

    public string Status { get; set; } = null!;

    public virtual Driver Driver { get; set; } = null!;

    public virtual Schedule Schedule { get; set; } = null!;
}
