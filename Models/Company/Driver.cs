using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Driver
{
    public int DriverId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string LicenseNo { get; set; } = null!;

    public string? ContactNumber { get; set; }

    public int? ExperienceYrs { get; set; }

    public decimal? RatingAvg { get; set; }

    public virtual ICollection<DriverAssignment> DriverAssignments { get; set; } = new List<DriverAssignment>();
}
