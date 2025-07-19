using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class TrainClass
{
    public int Id { get; set; }

    public Guid TrainId { get; set; }

    public string ClassName { get; set; } = null!;

    public int TotalSeats { get; set; }

    public int AvailableSeats { get; set; }

    public decimal Price { get; set; }

    public virtual Train Train { get; set; } = null!;
}
