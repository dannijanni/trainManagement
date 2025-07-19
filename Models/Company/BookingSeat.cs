using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class BookingSeat
{
    public int Id { get; set; }

    public Guid? BookingId { get; set; }

    public string? Class { get; set; }

    public string? SeatNumber { get; set; }

    public decimal? Price { get; set; }

    public virtual Booking? Booking { get; set; }
}
