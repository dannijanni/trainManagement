using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Seat
{
    public int SeatId { get; set; }

    public int ScheduleId { get; set; }

    public string Coach { get; set; } = null!;

    public string SeatNumber { get; set; } = null!;

    public string Class { get; set; } = null!;

    public bool IsAvailable { get; set; }

    public virtual Schedule Schedule { get; set; } = null!;

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
