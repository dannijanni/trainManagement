using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace train_management_system.Models.Company;

public partial class CompanyContext : DbContext
{
    public CompanyContext()
    {
    }

    public CompanyContext(DbContextOptions<CompanyContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<BookingSeat> BookingSeats { get; set; }

    public virtual DbSet<CashCollection> CashCollections { get; set; }

    public virtual DbSet<CashCollectionBooking> CashCollectionBookings { get; set; }

    public virtual DbSet<Driver> Drivers { get; set; }

    public virtual DbSet<Passenger> Passengers { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Route> Routes { get; set; }

    public virtual DbSet<RoutePricing> RoutePricings { get; set; }

    public virtual DbSet<RouteVium> RouteVia { get; set; }

    public virtual DbSet<Schedule> Schedules { get; set; }

    public virtual DbSet<SystemSetting> SystemSettings { get; set; }

    public virtual DbSet<Train> Trains { get; set; }

    public virtual DbSet<TrainClass> TrainClasses { get; set; }

    public virtual DbSet<TrainRouteVium> TrainRouteVia { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserActivity> UserActivities { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<ViewBookingSummary> ViewBookingSummaries { get; set; }

    public virtual DbSet<ViewTrainAvailability> ViewTrainAvailabilities { get; set; }

    public virtual DbSet<ViewUserDetail> ViewUserDetails { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            string dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? ".";
            string dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "train_management";
            string dbUser = Environment.GetEnvironmentVariable("DB_USER");
            string dbPass = Environment.GetEnvironmentVariable("DB_PASS");

            if (!string.IsNullOrEmpty(dbUser) && !string.IsNullOrEmpty(dbPass))
            {
                string connectionString =
                    $"Server={dbServer}; Database={dbName}; User ID={dbUser}; Password={dbPass}; TrustServerCertificate=True;";

                optionsBuilder.UseSqlServer(connectionString);
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Booking__3214EC07392B8D3F");

            entity.ToTable("Booking");

            entity.HasIndex(e => e.TrainId, "IX_Booking_TrainId");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.PaymentMethod).HasMaxLength(20);
            entity.Property(e => e.PaymentStatus).HasMaxLength(20);
            entity.Property(e => e.Qrcode).HasColumnName("QRCode");
            entity.Property(e => e.RefundAmount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.RefundProcessedBy).HasMaxLength(100);
            entity.Property(e => e.RefundStatus).HasMaxLength(20);
            entity.Property(e => e.SpecialBookingCode).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<BookingSeat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BookingS__3214EC0724477C9A");

            entity.ToTable("BookingSeat");

            entity.Property(e => e.Class).HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.SeatNumber).HasMaxLength(20);

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingSeats)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__BookingSe__Booki__6754599E");
        });

        modelBuilder.Entity<CashCollection>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CashColl__3214EC075D264A3A");

            entity.ToTable("CashCollection");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CashierName).HasMaxLength(100);
            entity.Property(e => e.CounterLocation).HasMaxLength(100);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<CashCollectionBooking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CashColl__3214EC07E9D944CD");

            entity.ToTable("CashCollectionBooking");

            entity.HasOne(d => d.Booking).WithMany(p => p.CashCollectionBookings)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__CashColle__Booki__6FE99F9F");

            entity.HasOne(d => d.CashCollection).WithMany(p => p.CashCollectionBookings)
                .HasForeignKey(d => d.CashCollectionId)
                .HasConstraintName("FK__CashColle__CashC__6EF57B66");
        });

        modelBuilder.Entity<Driver>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Driver__3214EC0761853998");

            entity.ToTable("Driver");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Availability).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.LicenseNumber).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);
        });

        modelBuilder.Entity<Passenger>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Passenge__3214EC07DF66097C");

            entity.ToTable("Passenger");

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);

            entity.HasOne(d => d.Booking).WithMany(p => p.Passengers)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Passenger__Booki__6477ECF3");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Payment__3214EC0762C36158");

            entity.ToTable("Payment");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CounterLocation).HasMaxLength(100);
            entity.Property(e => e.Method).HasMaxLength(20);
            entity.Property(e => e.ProcessedBy).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TransactionId).HasMaxLength(100);

            entity.HasOne(d => d.Booking).WithMany(p => p.Payments)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Payment__Booking__6A30C649");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1A6FC2D5FB");

            entity.ToTable("Role");

            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Route>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Route__3214EC07A8833204");

            entity.ToTable("Route");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.EstimatedDuration).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.RouteFrom).HasMaxLength(100);
            entity.Property(e => e.RouteTo).HasMaxLength(100);
        });

        modelBuilder.Entity<RoutePricing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RoutePri__3214EC0722D4EDED");

            entity.ToTable("RoutePricing");

            entity.Property(e => e.ClassName).HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Route).WithMany(p => p.RoutePricings)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RoutePric__Route__4F7CD00D");
        });

        modelBuilder.Entity<RouteVium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RouteVia__3214EC075E4E7070");

            entity.Property(e => e.Via).HasMaxLength(100);

            entity.HasOne(d => d.Route).WithMany(p => p.RouteVia)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RouteVia__RouteI__4CA06362");
        });

        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Schedule__3214EC07103BE6A9");

            entity.ToTable("Schedule");

            entity.HasIndex(e => e.Date, "IX_Schedule_Date");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Frequency).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Route).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Schedule__RouteI__5441852A");

            entity.HasOne(d => d.Train).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.TrainId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Schedule__TrainI__5535A963");
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SystemSe__3214EC07D79E839C");

            entity.Property(e => e.ApiKey).HasMaxLength(100);
            entity.Property(e => e.CompanyAddress).HasMaxLength(200);
            entity.Property(e => e.CompanyEmail).HasMaxLength(100);
            entity.Property(e => e.CompanyName).HasMaxLength(100);
            entity.Property(e => e.CompanyPhone).HasMaxLength(20);
            entity.Property(e => e.Currency).HasMaxLength(10);
            entity.Property(e => e.PaymentGatewayProvider).HasMaxLength(50);
            entity.Property(e => e.SecretKey).HasMaxLength(100);
            entity.Property(e => e.Timezone).HasMaxLength(50);
        });

        modelBuilder.Entity<Train>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Train__3214EC072D6B1814");

            entity.ToTable("Train");

            entity.HasIndex(e => e.Number, "UQ__Train__78A1A19D577401CB").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Number).HasMaxLength(20);
            entity.Property(e => e.RouteFrom).HasMaxLength(100);
            entity.Property(e => e.RouteTo).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);
        });

        modelBuilder.Entity<TrainClass>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TrainCla__3214EC07FECE6976");

            entity.ToTable("TrainClass");

            entity.Property(e => e.ClassName).HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Train).WithMany(p => p.TrainClasses)
                .HasForeignKey(d => d.TrainId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TrainClas__Train__47DBAE45");
        });

        modelBuilder.Entity<TrainRouteVium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TrainRou__3214EC07F4E6C34B");

            entity.Property(e => e.Via).HasMaxLength(100);

            entity.HasOne(d => d.Train).WithMany(p => p.TrainRouteVia)
                .HasForeignKey(d => d.TrainId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TrainRout__Train__44FF419A");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C52692265");

            entity.ToTable("User", tb => tb.HasTrigger("trg_UserInsert"));

            entity.HasIndex(e => e.Email, "IX_User_Email");

            entity.HasIndex(e => e.Username, "UQ__User__536C85E4101ECF22").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__User__A9D105345675CF24").IsUnique();

            entity.Property(e => e.UserId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.EmployeeId).HasMaxLength(50);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Username).HasMaxLength(50);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User__RoleId__3E52440B");
        });

        modelBuilder.Entity<UserActivity>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserActi__3214EC07F0C2DADC");

            entity.ToTable("UserActivity");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(45);

            entity.HasOne(d => d.User).WithMany(p => p.UserActivities)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__UserActiv__UserI__72C60C4A");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vehicle__3214EC07950BA4E4");

            entity.ToTable("Vehicle");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Manufacturer).HasMaxLength(100);
            entity.Property(e => e.Model).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.RegistrationNumber).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Type).HasMaxLength(20);
        });

        modelBuilder.Entity<ViewBookingSummary>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("View_BookingSummary");

            entity.Property(e => e.BookingStatus).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PaymentStatus).HasMaxLength(20);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TrainName).HasMaxLength(100);
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        modelBuilder.Entity<ViewTrainAvailability>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("View_TrainAvailability");

            entity.Property(e => e.ClassName).HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TrainName).HasMaxLength(100);
        });

        modelBuilder.Entity<ViewUserDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("View_UserDetails");

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.RoleName).HasMaxLength(50);
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
