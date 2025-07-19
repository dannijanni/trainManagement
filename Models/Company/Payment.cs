using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Payment
{
    public Guid Id { get; set; }

    public Guid? BookingId { get; set; }

    public decimal? Amount { get; set; }

    public string? Method { get; set; }

    public string? Status { get; set; }

    public string? TransactionId { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? ProcessedBy { get; set; }

    public string? CounterLocation { get; set; }

    public string? Notes { get; set; }

    public virtual Booking? Booking { get; set; }
}
