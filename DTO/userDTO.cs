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
    }
}
