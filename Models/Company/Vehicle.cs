using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Vehicle
{
    public Guid Id { get; set; }

    public string? Name { get; set; }

    public string? Type { get; set; }

    public int Capacity { get; set; }

    public string? Status { get; set; }

    public string? RegistrationNumber { get; set; }

    public string? Manufacturer { get; set; }

    public string? Model { get; set; }

    public int? YearOfManufacture { get; set; }

    public DateTime? LastMaintenance { get; set; }

    public DateTime? NextMaintenance { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
