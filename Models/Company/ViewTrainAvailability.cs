using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class ViewTrainAvailability
{
    public Guid TrainId { get; set; }

    public string TrainName { get; set; } = null!;

    public string ClassName { get; set; } = null!;

    public int TotalSeats { get; set; }

    public int AvailableSeats { get; set; }

    public decimal Price { get; set; }
}
