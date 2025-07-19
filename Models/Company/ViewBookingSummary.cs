using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class ViewBookingSummary
{
    public Guid BookingId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string TrainName { get; set; } = null!;

    public decimal? TotalAmount { get; set; }

    public string? BookingStatus { get; set; }

    public string? PaymentStatus { get; set; }

    public DateOnly? TravelDate { get; set; }

    public DateTime? BookingDate { get; set; }
}
