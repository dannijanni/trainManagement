using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Booking
{
    public int BookingId { get; set; }

    public int UserId { get; set; }

    public int ScheduleId { get; set; }

    public DateTime BookingDate { get; set; }

    public string Status { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public string PaymentStatus { get; set; } = null!;

    public string? QrcodeData { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Schedule Schedule { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
}
