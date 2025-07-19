using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class VwSeatAvailability
{
    public int ScheduleId { get; set; }

    public int? AvailableSeats { get; set; }

    public int? TotalSeats { get; set; }
}
