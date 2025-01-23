using TaskManagement.Data;
using TaskManagement.Services;
using TaskManagement.Hubs;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.WithOrigins("http://localhost:5174")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials());
});

// Add services to the container
builder.Services.AddControllersWithViews();

// Register DbContext
builder.Services.AddDbContext<TaskManagementDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services for Dependency Injection
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();

// Register SignalR services
builder.Services.AddSignalR();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Add CORS middleware - must come before endpoints
app.UseCors("AllowAll");



app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Management API v1");
    options.RoutePrefix = "swagger"; // Access Swagger at /swagger
});

// Configure endpoints
app.UseEndpoints(endpoints =>
{
    // Map SignalR hub
    endpoints.MapHub<TaskHub>("/taskHub");

    // Map Controller routes
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");

    // Map API controllers
    endpoints.MapControllers();
});

app.Run();
