using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Passenger
{
    public int Id { get; set; }

    public Guid? BookingId { get; set; }

    public string? Name { get; set; }

    public int? Age { get; set; }

    public string? Gender { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public virtual Booking? Booking { get; set; }
}
