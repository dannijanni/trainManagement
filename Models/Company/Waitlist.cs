using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class Waitlist
{
    public int WaitlistId { get; set; }

    public int UserId { get; set; }

    public int ScheduleId { get; set; }

    public DateTime RequestedAt { get; set; }

    public virtual Schedule Schedule { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
