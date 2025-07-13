import { User, Train, Booking, Seat, Analytics, Route, Schedule, Vehicle, Driver, SystemSettings, UserActivity } from '../types';

class LocalStorageManager {
  private static instance: LocalStorageManager;

  private constructor() {}

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  // Users
  getUsers(): User[] {
    const users = localStorage.getItem('train_users');
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users: User[]): void {
    localStorage.setItem('train_users', JSON.stringify(users));
  }

  // Trains
  getTrains(): Train[] {
    const trains = localStorage.getItem('train_trains');
    return trains ? JSON.parse(trains) : [];
  }

  saveTrains(trains: Train[]): void {
    localStorage.setItem('train_trains', JSON.stringify(trains));
  }

  // Routes
  getRoutes(): Route[] {
    const routes = localStorage.getItem('train_routes');
    return routes ? JSON.parse(routes) : [];
  }

  saveRoutes(routes: Route[]): void {
    localStorage.setItem('train_routes', JSON.stringify(routes));
  }

  // Schedules
  getSchedules(): Schedule[] {
    const schedules = localStorage.getItem('train_schedules');
    return schedules ? JSON.parse(schedules) : [];
  }

  saveSchedules(schedules: Schedule[]): void {
    localStorage.setItem('train_schedules', JSON.stringify(schedules));
  }

  // Vehicles
  getVehicles(): Vehicle[] {
    const vehicles = localStorage.getItem('train_vehicles');
    return vehicles ? JSON.parse(vehicles) : [];
  }

  saveVehicles(vehicles: Vehicle[]): void {
    localStorage.setItem('train_vehicles', JSON.stringify(vehicles));
  }

  // Drivers
  getDrivers(): Driver[] {
    const drivers = localStorage.getItem('train_drivers');
    return drivers ? JSON.parse(drivers) : [];
  }

  saveDrivers(drivers: Driver[]): void {
    localStorage.setItem('train_drivers', JSON.stringify(drivers));
  }

  // Bookings
  getBookings(): Booking[] {
    const bookings = localStorage.getItem('train_bookings');
    return bookings ? JSON.parse(bookings) : [];
  }

  saveBookings(bookings: Booking[]): void {
    localStorage.setItem('train_bookings', JSON.stringify(bookings));
  }

  // Seats
  getSeats(): Seat[] {
    const seats = localStorage.getItem('train_seats');
    return seats ? JSON.parse(seats) : [];
  }

  saveSeats(seats: Seat[]): void {
    localStorage.setItem('train_seats', JSON.stringify(seats));
  }

  // System Settings
  getSystemSettings(): SystemSettings {
    const settings = localStorage.getItem('train_settings');
    return settings ? JSON.parse(settings) : this.getDefaultSettings();
  }

  saveSystemSettings(settings: SystemSettings): void {
    localStorage.setItem('train_settings', JSON.stringify(settings));
  }

  // User Activities
  getUserActivities(): UserActivity[] {
    const activities = localStorage.getItem('train_activities');
    return activities ? JSON.parse(activities) : [];
  }

  saveUserActivities(activities: UserActivity[]): void {
    localStorage.setItem('train_activities', JSON.stringify(activities));
  }

  // Payments
  getPayments(): Payment[] {
    const payments = localStorage.getItem('train_payments');
    return payments ? JSON.parse(payments) : [];
  }

  savePayments(payments: Payment[]): void {
    localStorage.setItem('train_payments', JSON.stringify(payments));
  }

  // Cash Collections
  getCashCollections(): CashCollection[] {
    const collections = localStorage.getItem('train_cash_collections');
    return collections ? JSON.parse(collections) : [];
  }

  saveCashCollections(collections: CashCollection[]): void {
    localStorage.setItem('train_cash_collections', JSON.stringify(collections));
  }

  logUserActivity(userId: string, action: string, details: string): void {
    const activities = this.getUserActivities();
    const activity: UserActivity = {
      id: Date.now().toString(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1' // Mock IP
    };
    activities.push(activity);
    this.saveUserActivities(activities);
  }

  // Analytics
  getAnalytics(): Analytics {
    const analytics = localStorage.getItem('train_analytics');
    return analytics ? JSON.parse(analytics) : this.getDefaultAnalytics();
  }

  saveAnalytics(analytics: Analytics): void {
    localStorage.setItem('train_analytics', JSON.stringify(analytics));
  }

  private getDefaultSettings(): SystemSettings {
    return {
      companyName: 'TrainWay Express',
      companyEmail: 'info@trainway.com',
      companyPhone: '+1-800-TRAINWAY',
      companyAddress: '123 Railway Street, Transport City, TC 12345',
      currency: 'USD',
      timezone: 'America/New_York',
      emailNotifications: {
        bookingConfirmation: true,
        cancellation: true,
        reminders: true
      },
      bookingRules: {
        cancellationDeadline: 2,
        refundPercentage: 80,
        maxBookingsPerUser: 10,
        advanceBookingDays: 90
      },
      paymentGateway: {
        provider: 'stripe',
        apiKey: 'pk_test_...',
        secretKey: 'sk_test_...',
        isTestMode: true
      }
    };
  }

  private getDefaultAnalytics(): Analytics {
    return {
      totalRevenue: 0,
      totalBookings: 0,
      totalUsers: 0,
      popularRoutes: [],
      monthlyRevenue: [],
      onlineRevenue: 0,
      manualRevenue: 0,
      deferredRevenue: 0,
      occupancyRate: 0,
      userGrowth: [],
      bookingTrends: [],
      peakBookingHours: [],
      routePerformance: [],
      driverPerformance: []
    };
  }

  // Initialize default data
  initializeData(): void {
    if (!localStorage.getItem('train_initialized')) {
      this.seedDefaultData();
      localStorage.setItem('train_initialized', 'true');
    }
  }

  private seedDefaultData(): void {
    // Default users with different roles
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@trainway.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+1234567890',
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: ['all']
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@trainway.com',
        password: 'manager123',
        role: 'manager',
        firstName: 'John',
        lastName: 'Manager',
        phone: '+1234567891',
        createdAt: new Date().toISOString(),
        isActive: true,
        department: 'Operations'
      },
      {
        id: '3',
        username: 'staff',
        email: 'staff@trainway.com',
        password: 'staff123',
        role: 'staff',
        firstName: 'Jane',
        lastName: 'Staff',
        phone: '+1234567892',
        createdAt: new Date().toISOString(),
        isActive: true,
        department: 'Customer Service',
        employeeId: 'EMP001'
      }
    ];

    // Default routes
    const defaultRoutes: Route[] = [
      {
        id: '1',
        name: 'NYC-Chicago Express',
        from: 'New York',
        to: 'Chicago',
        via: ['Philadelphia', 'Pittsburgh'],
        distance: 790,
        estimatedDuration: '8h 30m',
        isActive: true,
        pricing: {
          'First Class': 299,
          'Business Class': 199,
          'Economy Class': 99
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'LA-SF Coastal',
        from: 'Los Angeles',
        to: 'San Francisco',
        via: ['Santa Barbara', 'San Luis Obispo'],
        distance: 382,
        estimatedDuration: '8h 30m',
        isActive: true,
        pricing: {
          'First Class': 349,
          'Business Class': 229,
          'Economy Class': 129
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Default vehicles
    const defaultVehicles: Vehicle[] = [
      {
        id: '1',
        name: 'Express Lightning',
        type: 'train',
        capacity: 140,
        status: 'active',
        registrationNumber: 'TRN001',
        manufacturer: 'Siemens',
        model: 'Velaro',
        yearOfManufacture: 2020,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Coastal Cruiser',
        type: 'train',
        capacity: 168,
        status: 'active',
        registrationNumber: 'TRN002',
        manufacturer: 'Alstom',
        model: 'AGV',
        yearOfManufacture: 2021,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Default drivers
    const defaultDrivers: Driver[] = [
      {
        id: '1',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'mjohnson@trainway.com',
        phone: '+1234567893',
        licenseNumber: 'TDL001',
        licenseExpiry: '2025-12-31',
        status: 'active',
        experience: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'swilliams@trainway.com',
        phone: '+1234567894',
        licenseNumber: 'TDL002',
        licenseExpiry: '2026-06-30',
        status: 'active',
        experience: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Default trains
    const defaultTrains: Train[] = [
      {
        id: '1',
        name: 'Express Lightning',
        number: 'EL001',
        route: {
          from: 'New York',
          to: 'Chicago',
          via: ['Philadelphia', 'Pittsburgh']
        },
        schedule: {
          departure: '08:00',
          arrival: '16:30',
          duration: '8h 30m'
        },
        classes: {
          'First Class': {
            totalSeats: 20,
            availableSeats: 18,
            price: 299
          },
          'Business Class': {
            totalSeats: 40,
            availableSeats: 35,
            price: 199
          },
          'Economy Class': {
            totalSeats: 80,
            availableSeats: 72,
            price: 99
          }
        },
        status: 'active',
        amenities: ['WiFi', 'Dining Car', 'AC', 'Charging Ports'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vehicleId: '1',
        driverId: '1'
      },
      {
        id: '2',
        name: 'Coastal Cruiser',
        number: 'CC002',
        route: {
          from: 'Los Angeles',
          to: 'San Francisco',
          via: ['Santa Barbara', 'San Luis Obispo']
        },
        schedule: {
          departure: '10:15',
          arrival: '18:45',
          duration: '8h 30m'
        },
        classes: {
          'First Class': {
            totalSeats: 24,
            availableSeats: 22,
            price: 349
          },
          'Business Class': {
            totalSeats: 48,
            availableSeats: 44,
            price: 229
          },
          'Economy Class': {
            totalSeats: 96,
            availableSeats: 88,
            price: 129
          }
        },
        status: 'active',
        amenities: ['WiFi', 'Dining Car', 'AC', 'Scenic Views'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vehicleId: '2',
        driverId: '2'
      }
    ];

    this.saveUsers(defaultUsers);
    this.saveRoutes(defaultRoutes);
    this.saveVehicles(defaultVehicles);
    this.saveDrivers(defaultDrivers);
    this.saveTrains(defaultTrains);
    this.saveBookings([]);
    this.saveSeats([]);
    this.saveSchedules([]);
    this.saveSystemSettings(this.getDefaultSettings());
    this.saveAnalytics(this.getDefaultAnalytics());
    this.saveUserActivities([]);
  }

  clearAll(): void {
    localStorage.removeItem('train_users');
    localStorage.removeItem('train_trains');
    localStorage.removeItem('train_routes');
    localStorage.removeItem('train_schedules');
    localStorage.removeItem('train_vehicles');
    localStorage.removeItem('train_drivers');
    localStorage.removeItem('train_bookings');
    localStorage.removeItem('train_seats');
    localStorage.removeItem('train_settings');
    localStorage.removeItem('train_analytics');
    localStorage.removeItem('train_activities');
    localStorage.removeItem('train_payments');
    localStorage.removeItem('train_cash_collections');
    localStorage.removeItem('train_initialized');
  }
}

export default LocalStorageManager.getInstance();