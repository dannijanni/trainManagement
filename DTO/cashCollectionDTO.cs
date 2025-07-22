namespace train_management_system.DTO
{
    public class cashCollectionDTO
    {
        public class CreateCashCollectionRequest
        {
            public string CashierName { get; set; } = null!;
            public string CounterLocation { get; set; } = null!;
            public decimal TotalAmount { get; set; }
            public List<Guid> BookingIds { get; set; } = new();
            public string? Notes { get; set; }
        }
    }
}
