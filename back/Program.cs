using Supabase;

var builder = WebApplication.CreateBuilder(args);

// 1. Configura o CORS (Permite que o React aceda à API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .AllowAnyOrigin() // Em produção, mude para a URL do seu site
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// 2. Configura o Supabase com seus dados reais
// Tenta ler do appsettings, se não existir, usa as chaves hardcoded (Fallback para evitar crash)
var url = builder.Configuration["Supabase:Url"] ?? "https://pytnkwlnvcwwvaadvjqn.supabase.co";
var key = builder.Configuration["Supabase:Key"] ?? "sb_publishable_fdaD1OvtomjxY-Q3fB_FPg_VeZISBgR";

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

// Comentei a verificação de ambiente para garantir que o Swagger abra localmente
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }

// 3. Ativa o CORS (Importante: tem de ser antes do MapControllers)
app.UseCors("AllowReact");

// app.UseHttpsRedirection(); // Comente se tiver problemas com certificado SSL local
app.UseAuthorization();
app.MapControllers();

app.Run();