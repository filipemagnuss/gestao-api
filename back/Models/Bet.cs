using Postgrest.Attributes;
using Postgrest.Models;

namespace BetManager.Api.Models
{
    [Table("bets")]
    public class Bet : BaseModel
    {
        [Column("user_id")]
        public string? UserId { get; set; } 

        [PrimaryKey("id", false)]
        public long Id { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("amount")]
        public decimal Amount { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}