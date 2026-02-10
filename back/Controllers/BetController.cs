using Microsoft.AspNetCore.Mvc;
using BetManager.Api.Models;

namespace BetManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BetsController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public BetsController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        // GET: api/bets (Pega todas as apostas)
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await _supabase.From<Bet>().Get();
            return Ok(response.Models);
        }

        // POST: api/bets (Salva uma nova aposta)
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Bet bet)
        {
            try
            {
                var response = await _supabase.From<Bet>().Insert(bet);
                return Ok(response.Models.FirstOrDefault());
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}