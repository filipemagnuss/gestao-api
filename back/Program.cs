using Supabase;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURAÇÃO DO SUPABASE ---
// Cole sua Project URL aqui (ex: https://xyz.supabase.co)
var url = "SUA_URL_AQUI"; 

// Cole sua Publishable Key aqui (a do seu print, começa com sb_publishable...)
var key = "SUA_KEY_AQUI";

var options = new Supabase.SupabaseOptions
{
    AutoRefreshToken = true,
    AutoConnectRealtime = true
};

// Injeta o Supabase para ser usado em todo o projeto
builder.Services.AddSingleton(provider => new Supabase.Client(url, key, options));
// --------------------------------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configura o Swagger (para testar a API visualmente)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();