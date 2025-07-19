using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class TrainRouteVium
{
    public int Id { get; set; }

    public Guid TrainId { get; set; }

    public string Via { get; set; } = null!;

    public virtual Train Train { get; set; } = null!;
}
