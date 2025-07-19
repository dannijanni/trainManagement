using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class CashCollectionBooking
{
    public int Id { get; set; }

    public Guid? CashCollectionId { get; set; }

    public Guid? BookingId { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual CashCollection? CashCollection { get; set; }
}
