using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Train
{
    public int TrainId { get; set; }

    public string TrainNumber { get; set; } = null!;

    public string TrainName { get; set; } = null!;

    public int TotalSeats { get; set; }

    public string? ClassInfoJson { get; set; }

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
