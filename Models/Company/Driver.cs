using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Driver
{
    public Guid Id { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? LicenseNumber { get; set; }

    public DateOnly? LicenseExpiry { get; set; }

    public string? Status { get; set; }

    public int? Experience { get; set; }

    public double? Rating { get; set; }

    public int? TotalTrips { get; set; }

    public string? Availability { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
