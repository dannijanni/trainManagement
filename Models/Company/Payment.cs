using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int BookingId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    public string PaymentType { get; set; } = null!;

    public string? DetailsJson { get; set; }

    public virtual Booking Booking { get; set; } = null!;
}
