using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class SystemSetting
{
    public int Id { get; set; }

    public string? CompanyName { get; set; }

    public string? CompanyEmail { get; set; }

    public string? CompanyPhone { get; set; }

    public string? CompanyAddress { get; set; }

    public string? Currency { get; set; }

    public string? Timezone { get; set; }

    public bool? EmailBookingConfirmation { get; set; }

    public bool? EmailCancellation { get; set; }

    public bool? EmailReminders { get; set; }

    public int? CancellationDeadline { get; set; }

    public double? RefundPercentage { get; set; }

    public int? MaxBookingsPerUser { get; set; }

    public int? AdvanceBookingDays { get; set; }

    public string? PaymentGatewayProvider { get; set; }

    public string? ApiKey { get; set; }

    public string? SecretKey { get; set; }

    public bool? IsTestMode { get; set; }
}
