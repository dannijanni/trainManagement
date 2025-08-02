export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
  permissions?: string[];
  department?: string;
  employeeId?: string;
}

export interface Train {
  routeFrom: any;
  routeTo: any;
  trainRouteVia: any;
  schedules: any;
  trainClasses: any;
  id: string;
  name: string;
  number: string;
  route: {
    from: string;
    to: string;
    via: string[];
  };
  schedule: {
    departure: string;
    arrival: string;
    duration: string;
  };
  classes: {
    [key: string]: {
      totalSeats: number;
      availableSeats: number;
      price: number;
    };
  };
  status: 'active' | 'cancelled' | 'delayed' | 'maintenance';
  amenities: string[];
  createdAt: string;
  updatedAt: string;
  vehicleId?: string;
  driverId?: string;
}

export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  via: string[];
  distance: number;
  estimatedDuration: string;
  isActive: boolean;
  pricing: {
    [key: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  routeId: string;
  trainId: string;
  driverId?: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  daysOfWeek?: number[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'delayed';
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'train' | 'bus' | 'metro';
  capacity: number;
  status: 'active' | 'maintenance' | 'retired';
  registrationNumber: string;
  manufacturer: string;
  model: string;
  yearOfManufacture: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'active' | 'inactive' | 'suspended';
  experience: number;
  rating: number;
  totalTrips: number;
  availability: 'available' | 'on-duty' | 'off-duty';
  workHours: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  assignedRoutes: string[];
  performance: {
    onTimePercentage: number;
    customerRating: number;
    totalRatings: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  trainId: string;
  class: string;
  seatNumber: string;
  isBooked: boolean;
  isBlocked: boolean;
  bookingId?: string;
}

export interface Booking {
  passengers: any;
  bookingSeats: any;
  id: string;
  trainId: string;
  userId: string;
  passengerDetails: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    email: string;
    phone: string;
  }[];
  seats: {
    class: string;
    seatNumber: string;
    price: number;
  }[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'pending' | 'waitlisted' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'manual' | 'deferred';
  paymentDetails?: {
    method: 'card' | 'wallet' | 'netbanking' | 'cash' | 'deferred';
    transactionId?: string;
    cashierName?: string;
    counterLocation?: string;
    deferralReason?: string;
    paymentDeadline?: string;
  };
  paymentId?: string;
  bookingDate: string;
  travelDate: string;
  qrCode: string;
  cancellationReason?: string;
  cancellationDate?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed';
  refundProcessedBy?: string;
  createdBy?: string;
  notes?: string;
  specialBookingCode?: string;
  isAdminBooking?: boolean;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'card' | 'wallet' | 'netbanking' | 'cash' | 'deferred';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  processedBy?: string;
  counterLocation?: string;
  notes?: string;
}

export interface CashCollection {
  id: string;
  date: string;
  cashierName: string;
  counterLocation: string;
  totalAmount: number;
  bookingIds: string[];
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  timezone: string;
  emailNotifications: {
    bookingConfirmation: boolean;
    cancellation: boolean;
    reminders: boolean;
  };
  bookingRules: {
    cancellationDeadline: number; // hours before departure
    refundPercentage: number;
    maxBookingsPerUser: number;
    advanceBookingDays: number;
  };
  paymentGateway: {
    provider: string;
    apiKey: string;
    secretKey: string;
    isTestMode: boolean;
  };
}

export interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  popularRoutes: {
    route: string;
    count: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  occupancyRate: number;
  userGrowth: {
    month: string;
    users: number;
  }[];
  bookingTrends: {
    date: string;
    bookings: number;
  }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface SearchFilters {
  from: string;
  to: string;
  date: string;
  class: string;
  passengers: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}