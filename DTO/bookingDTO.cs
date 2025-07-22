namespace train_management_system.DTO
{
    public class bookingDTO
    {
        public class CreateBookingRequest
        {
            public Guid TrainId { get; set; }
            public Guid UserId { get; set; }
            public List<PassengerDto> PassengerDetails { get; set; } = new();
            public List<SeatDto> Seats { get; set; } = new();
            public decimal TotalAmount { get; set; }
            public string Status { get; set; } = "pending";
            public string PaymentStatus { get; set; } = "pending";
            public string PaymentMethod { get; set; } = "online";
            public PaymentDetailsDto? PaymentDetails { get; set; }
            public Guid? PaymentId { get; set; }
            public string BookingDate { get; set; } = string.Empty;  // ISO string
            public string TravelDate { get; set; } = string.Empty;   // yyyy-MM-dd
            public string QrCode { get; set; } = string.Empty;
            public string? CreatedBy { get; set; }
            public string? Notes { get; set; }
            public string? SpecialBookingCode { get; set; }
            public bool IsAdminBooking { get; set; } = false;
        }

        public class PassengerDto
        {
            public string Name { get; set; } = "";
            public int Age { get; set; }
            public string Gender { get; set; } = "other";
            public string Email { get; set; } = "";
            public string Phone { get; set; } = "";
        }

        public class SeatDto
        {
            public string Class { get; set; } = "";
            public string SeatNumber { get; set; } = "";
            public decimal Price { get; set; }
        }

        public class PaymentDetailsDto
        {
            public string Method { get; set; } = "card";
            public string? TransactionId { get; set; }
            public string? CashierName { get; set; }
            public string? CounterLocation { get; set; }
            public string? DeferralReason { get; set; }
            public string? PaymentDeadline { get; set; }
        }
    }
}
