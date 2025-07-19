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

    public virtual DbSet<Driver> Drivers { get; set; }

    public virtual DbSet<DriverAssignment> DriverAssignments { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Route> Routes { get; set; }

    public virtual DbSet<RouteStop> RouteStops { get; set; }

    public virtual DbSet<Schedule> Schedules { get; set; }

    public virtual DbSet<Seat> Seats { get; set; }

    public virtual DbSet<Station> Stations { get; set; }

    public virtual DbSet<Train> Trains { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<VwRevenueByRoute> VwRevenueByRoutes { get; set; }

    public virtual DbSet<VwSeatAvailability> VwSeatAvailabilities { get; set; }

    public virtual DbSet<Waitlist> Waitlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=192.168.100.8;Database=train_management;User Id=sa;Password=123;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Bookings__73951ACDB7695509");

            entity.HasIndex(e => e.ScheduleId, "IDX_Booking_Schedule");

            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.BookingDate)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentStatus).HasMaxLength(20);
            entity.Property(e => e.QrcodeData).HasColumnName("QRCodeData");
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Schedule).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.ScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__Schedu__5812160E");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__UserID__571DF1D5");

            entity.HasMany(d => d.Seats).WithMany(p => p.Bookings)
                .UsingEntity<Dictionary<string, object>>(
                    "BookingSeat",
                    r => r.HasOne<Seat>().WithMany()
                        .HasForeignKey("SeatId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__BookingSe__SeatI__5CD6CB2B"),
                    l => l.HasOne<Booking>().WithMany()
                        .HasForeignKey("BookingId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__BookingSe__Booki__5BE2A6F2"),
                    j =>
                    {
                        j.HasKey("BookingId", "SeatId").HasName("PK__BookingS__50846BF0C87E4458");
                        j.ToTable("BookingSeats");
                        j.IndexerProperty<int>("BookingId").HasColumnName("BookingID");
                        j.IndexerProperty<int>("SeatId").HasColumnName("SeatID");
                    });
        });

        modelBuilder.Entity<Driver>(entity =>
        {
            entity.HasKey(e => e.DriverId).HasName("PK__Drivers__F1B1CD2463ED4506");

            entity.HasIndex(e => e.LicenseNo, "UQ__Drivers__72D7E8705FE89BCA").IsUnique();

            entity.Property(e => e.DriverId).HasColumnName("DriverID");
            entity.Property(e => e.ContactNumber).HasMaxLength(20);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.LicenseNo).HasMaxLength(50);
            entity.Property(e => e.RatingAvg)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(3, 2)");
        });

        modelBuilder.Entity<DriverAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__DriverAs__32499E5720A3112F");

            entity.Property(e => e.AssignmentId).HasColumnName("AssignmentID");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DriverId).HasColumnName("DriverID");
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Driver).WithMany(p => p.DriverAssignments)
                .HasForeignKey(d => d.DriverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DriverAss__Drive__6C190EBB");

            entity.HasOne(d => d.Schedule).WithMany(p => p.DriverAssignments)
                .HasForeignKey(d => d.ScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DriverAss__Sched__6D0D32F4");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A58FE1BDFD5");

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.DetailsJson).HasColumnName("DetailsJSON");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentType).HasMaxLength(20);

            entity.HasOne(d => d.Booking).WithMany(p => p.Payments)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__Bookin__6477ECF3");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A6AB9B3D6");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B6160BA906C50").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Route>(entity =>
        {
            entity.HasKey(e => e.RouteId).HasName("PK__Routes__80979AAD274FDFA1");

            entity.Property(e => e.RouteId).HasColumnName("RouteID");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.RouteName).HasMaxLength(200);
        });

        modelBuilder.Entity<RouteStop>(entity =>
        {
            entity.HasKey(e => new { e.RouteId, e.StopOrder }).HasName("PK__RouteSto__97954C5C1886C3F6");

            entity.Property(e => e.RouteId).HasColumnName("RouteID");
            entity.Property(e => e.StationId).HasColumnName("StationID");

            entity.HasOne(d => d.Route).WithMany(p => p.RouteStops)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RouteStop__Route__49C3F6B7");

            entity.HasOne(d => d.Station).WithMany(p => p.RouteStops)
                .HasForeignKey(d => d.StationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RouteStop__Stati__4AB81AF0");
        });

        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Schedule__9C8A5B69B6BD7D36");

            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.Frequency).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.RouteId).HasColumnName("RouteID");
            entity.Property(e => e.TrainId).HasColumnName("TrainID");

            entity.HasOne(d => d.Route).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Schedules__Route__4E88ABD4");

            entity.HasOne(d => d.Train).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.TrainId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Schedules__Train__4D94879B");
        });

        modelBuilder.Entity<Seat>(entity =>
        {
            entity.HasKey(e => e.SeatId).HasName("PK__Seats__311713D37FC4B79D");

            entity.HasIndex(e => new { e.ScheduleId, e.IsAvailable }, "IDX_Seat_Schedule");

            entity.HasIndex(e => new { e.ScheduleId, e.Coach, e.SeatNumber }, "UQ_ScheduleSeat").IsUnique();

            entity.Property(e => e.SeatId).HasColumnName("SeatID");
            entity.Property(e => e.Class).HasMaxLength(50);
            entity.Property(e => e.Coach).HasMaxLength(20);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.SeatNumber).HasMaxLength(10);

            entity.HasOne(d => d.Schedule).WithMany(p => p.Seats)
                .HasForeignKey(d => d.ScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Seats__ScheduleI__534D60F1");
        });

        modelBuilder.Entity<Station>(entity =>
        {
            entity.HasKey(e => e.StationId).HasName("PK__Stations__E0D8A6DD9E8ABB44");

            entity.HasIndex(e => e.Code, "UQ__Stations__A25C5AA76303EFB3").IsUnique();

            entity.Property(e => e.StationId).HasColumnName("StationID");
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Code).HasMaxLength(10);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.State).HasMaxLength(100);
        });

        modelBuilder.Entity<Train>(entity =>
        {
            entity.HasKey(e => e.TrainId).HasName("PK__Trains__8ED2725A66C72816");

            entity.HasIndex(e => e.TrainNumber, "UQ__Trains__10C2CD2FC332E7E9").IsUnique();

            entity.Property(e => e.TrainId).HasColumnName("TrainID");
            entity.Property(e => e.ClassInfoJson).HasColumnName("ClassInfoJSON");
            entity.Property(e => e.TrainName).HasMaxLength(200);
            entity.Property(e => e.TrainNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACEA50C943");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E4A4245631").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534653CF79B").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash).HasMaxLength(256);
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Username).HasMaxLength(100);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleID__3D5E1FD2");
        });

        modelBuilder.Entity<VwRevenueByRoute>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_RevenueByRoute");

            entity.Property(e => e.RouteId).HasColumnName("RouteID");
            entity.Property(e => e.RouteName).HasMaxLength(200);
            entity.Property(e => e.TotalRevenue).HasColumnType("decimal(38, 2)");
        });

        modelBuilder.Entity<VwSeatAvailability>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_SeatAvailability");

            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
        });

        modelBuilder.Entity<Waitlist>(entity =>
        {
            entity.HasKey(e => e.WaitlistId).HasName("PK__Waitlist__FE78FE8030C08AEC");

            entity.ToTable("Waitlist");

            entity.Property(e => e.WaitlistId).HasColumnName("WaitlistID");
            entity.Property(e => e.RequestedAt)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Schedule).WithMany(p => p.Waitlists)
                .HasForeignKey(d => d.ScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Waitlist__Schedu__60A75C0F");

            entity.HasOne(d => d.User).WithMany(p => p.Waitlists)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Waitlist__UserID__5FB337D6");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
