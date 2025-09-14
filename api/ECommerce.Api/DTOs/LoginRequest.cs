using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string EmailAddress { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
