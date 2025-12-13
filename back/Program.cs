using Supabase;

var builder = WebApplication.CreateBuilder(args);

// 1. Configura o CORS (Permite que o React aceda à API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// 2. Configura o Supabase
var url = "SUA_URL_AQUI"; // <--- COLOQUE SUA URL VERDADEIRA
var key = "SUA_KEY_AQUI"; // <--- COLOQUE SUA KEY VERDADEIRA

var options = new Supabase.SupabaseOptions
{
    AutoRefreshToken = true,
    AutoConnectRealtime = true
};
builder.Services.AddSingleton(provider => new Supabase.Client(url, key, options));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. Ativa o CORS (Importante: tem de ser antes do MapControllers)
app.UseCors("AllowReact");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();