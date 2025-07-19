using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class UserActivity
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public string? Action { get; set; }

    public string? Details { get; set; }

    public DateTime? Timestamp { get; set; }

    public string? IpAddress { get; set; }

    public virtual User? User { get; set; }
}
