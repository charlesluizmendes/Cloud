using Crud;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Context

var connectionString = builder.Configuration.GetConnectionString("SqlServerConnection");

if (!builder.Environment.IsDevelopment())
{
    var server = Environment.GetEnvironmentVariable("SERVER");
    var port = Environment.GetEnvironmentVariable("PORT");
    var database = Environment.GetEnvironmentVariable("DATABASE");
    var user = Environment.GetEnvironmentVariable("USER");
    var password = Environment.GetEnvironmentVariable("PASSWORD");

    connectionString = $"Server={server}, {port};Initial Catalog={database};User ID={user};Password={password}";
}

builder.Services.AddDbContext<Context>(o =>
     o.UseSqlServer(connectionString)
);

// HealthCheck
builder.Services.AddHealthChecks().AddSqlServer(connectionString);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // Migration
    Context.MigrationInitialisation(app);

    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Prometheus

var counter = Metrics.CreateCounter("webapimetric", "Counts requests to the WebApiMetrics API endpoints",
    new CounterConfiguration
    {
        LabelNames = new[] { "method", "endpoint" }
    });

app.Use((context, next) =>
{
    counter.WithLabels(context.Request.Method, context.Request.Path).Inc();
    return next();
});

app.UseMetricServer();
app.UseHttpMetrics();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapHealthChecks("/health");
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
