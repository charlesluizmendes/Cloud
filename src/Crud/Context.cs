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
    }
}
