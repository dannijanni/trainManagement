namespace train_management_system.DTO
{
    public class userDTO
    {
        public class CreateUserDto
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public int RoleId { get; set; }
        }

        public class UpdateUserDto
        {
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? Password { get; set; }
            public int RoleId { get; set; }
            public bool IsActive { get; set; }
        }
    }
}
