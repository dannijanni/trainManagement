using System.Security.Cryptography;
using System.Text;

namespace train_management_system.Utils
{
    public static class PasswordHelper
    {
        //Password Conversion
        public static byte[] HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
