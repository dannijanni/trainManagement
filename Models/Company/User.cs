using System;
using System.Collections.Generic;

namespace train_management_system.Models.Company;

public partial class User
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Phone { get; set; }

    public int RoleId { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTime? LastLogin { get; set; }

    public string? Department { get; set; }

    public string? EmployeeId { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<UserActivity> UserActivities { get; set; } = new List<UserActivity>();
}
