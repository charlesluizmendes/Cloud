using Crud.Models;
using Microsoft.EntityFrameworkCore;

namespace Crud
{
    public class Context : DbContext, IDisposable
    {
        public DbSet<Produto> Produto { get; set; }

        public Context(DbContextOptions<Context> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public static void MigrationInitialisation(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.CreateScope())
            {
                serviceScope.ServiceProvider.GetService<Context>().Database.Migrate();
            }
        }
    }
}
