using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Booking
{
    public Guid Id { get; set; }

    public Guid TrainId { get; set; }

    public Guid UserId { get; set; }

    public decimal? TotalAmount { get; set; }

    public string? Status { get; set; }

    public string? PaymentStatus { get; set; }

    public string? PaymentMethod { get; set; }

    public Guid? PaymentId { get; set; }

    public DateTime? BookingDate { get; set; }

    public DateOnly? TravelDate { get; set; }

    public string? Qrcode { get; set; }

    public string? CancellationReason { get; set; }

    public DateTime? CancellationDate { get; set; }

    public decimal? RefundAmount { get; set; }

    public string? RefundStatus { get; set; }

    public string? RefundProcessedBy { get; set; }

    public Guid? CreatedBy { get; set; }

    public string? Notes { get; set; }

    public string? SpecialBookingCode { get; set; }

    public bool? IsAdminBooking { get; set; }

    public virtual ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();

    public virtual ICollection<CashCollectionBooking> CashCollectionBookings { get; set; } = new List<CashCollectionBooking>();

    public virtual ICollection<Passenger> Passengers { get; set; } = new List<Passenger>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
