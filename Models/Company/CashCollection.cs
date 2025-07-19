using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class CashCollection
{
    public Guid Id { get; set; }

    public DateOnly? Date { get; set; }

    public string? CashierName { get; set; }

    public string? CounterLocation { get; set; }

    public decimal? TotalAmount { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public string? Notes { get; set; }

    public virtual ICollection<CashCollectionBooking> CashCollectionBookings { get; set; } = new List<CashCollectionBooking>();
}
