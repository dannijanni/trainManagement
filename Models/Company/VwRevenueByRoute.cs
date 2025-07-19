using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class VwRevenueByRoute
{
    public int RouteId { get; set; }

    public string RouteName { get; set; } = null!;

    public decimal? TotalRevenue { get; set; }

    public int? BookingCount { get; set; }
}
