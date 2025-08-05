import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Train,
  Calendar,
  MapPin,
  Clock,
  Star,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Booking, Train as TrainType, User, Driver, Route } from '../../types';
import { Base_URL } from '../../config';

const AnalyticsDashboard: React.FC = () => {
  //const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    onlineRevenue: 0,
    manualRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    occupancyRate: 0,
    popularRoutes: [] as { route: string; bookings: number; revenue: number }[],
    peakHours: [] as { hour: number; bookings: number }[],
    customerDemographics: {
      newCustomers: 0,
      returningCustomers: 0
    },
    driverPerformance: [] as { name: string; rating: number; trips: number }[],
    routePerformance: [] as { route: string; occupancy: number; revenue: number }[]
  });

  useEffect(() => {
    console.log("Initializing dashboard...");
    loadData();
  }, []);

  useEffect(() => {
    console.log("Checking for analytics calculation...", {
      bookings: bookings.length,
      trains: trains.length,
      users: users.length,
      drivers: drivers.length,
      routes: routes.length
    });
    
    if (bookings.length > 0) {
      console.log("Data available, calculating analytics");
      calculateAnalytics();
    }
  }, [bookings, trains, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log("Starting data fetch...");

      const [bookingsResponse, trainsResponse, usersResponse, driversResponse, routesResponse] = await Promise.all([
        axios.get(`${Base_URL}/booking/GetAllbookings`),
        axios.get(`${Base_URL}/train/all`),
        axios.get(`${Base_URL}/user/getAllUsers`),
        axios.get(`${Base_URL}/driver/all`),
        axios.get(`${Base_URL}/route/all`)
      ]);

      console.log("API responses received", {
        bookings: bookingsResponse.data,
        trains: trainsResponse.data,
        users: usersResponse.data,
        drivers: driversResponse.data,
        routes: routesResponse.data
      });

      // Handle the $values structure in API responses
      const bookingsData = bookingsResponse.data?.$values || [];
      const trainsData = trainsResponse.data?.$values || [];
      const usersData = usersResponse.data?.$values || [];
      const driversData = driversResponse.data?.$values || [];
      const routesData = routesResponse.data?.$values || [];

      setBookings(bookingsData.map(formatBooking));
      setTrains(trainsData.map(formatTrain));
      setUsers(usersData);
      setDrivers(driversData);
      setRoutes(routesData);

      console.log("Data formatted and set", {
        bookingsCount: bookingsData.length,
        trainsCount: trainsData.length,
        usersCount: usersData.length,
        driversCount: driversData.length,
        routesCount: routesData.length
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatBooking = (booking: any): Booking => {
    try {
      return {
        id: booking.id,
        trainId: booking.trainId,
        userId: booking.userId,
        passengerDetails: booking.passengers?.$values?.map((p: any) => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          email: p.email,
          phone: p.phone
        })) || [],
        seats: booking.bookingSeats?.$values?.map((s: any) => ({
          class: s.class,
          seatNumber: s.seatNumber,
          price: s.price
        })) || [],
        totalAmount: booking.totalAmount || 0,
        status: booking.status || 'pending',
        paymentStatus: booking.paymentStatus || 'pending',
        paymentMethod: booking.paymentMethod || 'online',
        bookingDate: booking.bookingDate || new Date().toISOString(),
        travelDate: booking.travelDate || new Date().toISOString(),
        qrCode: booking.qrcode || '',
        cancellationReason: booking.cancellationReason || undefined,
        cancellationDate: booking.cancellationDate || null,
        refundAmount: booking.refundAmount || 0,
        refundStatus: booking.refundStatus || 'pending',
        createdBy: booking.createdBy || '',
        notes: booking.notes || '',
        isAdminBooking: booking.isAdminBooking || false,
        passengers: undefined,
        bookingSeats: undefined
      };
    } catch (error) {
      console.error('Error formatting booking:', error, booking);
      return {
        id: booking.id || '',
        trainId: booking.trainId || '',
        userId: booking.userId || '',
        passengerDetails: [],
        seats: [],
        totalAmount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'online',
        bookingDate: new Date().toISOString(),
        travelDate: new Date().toISOString(),
        qrCode: '',
        cancellationReason: undefined,
        cancellationDate: undefined,
        refundAmount: 0,
        refundStatus: 'pending',
        createdBy: '',
        notes: '',
        isAdminBooking: false,
        passengers: undefined,
        bookingSeats: undefined
      };
    }
  };

  const formatTrain = (train: any): TrainType => {
    try {
      return {
        id: train.id,
        name: train.name,
        number: train.number,
        route: {
          from: train.routeFrom || '',
          to: train.routeTo || '',
          via: typeof train.trainRouteVia === 'string' ? 
            train.trainRouteVia.split(',').filter((v: string) => v.trim()) : []
        },
        schedule: {
          departure: train.schedules?.$values?.[0]?.departureTime || '',
          arrival: train.schedules?.$values?.[0]?.arrivalTime || '',
          duration: calculateDuration(
            train.schedules?.$values?.[0]?.departureTime,
            train.schedules?.$values?.[0]?.arrivalTime
          )
        },
        classes: Object.fromEntries(
          train.trainClasses?.$values?.map((c: any) => [
            c.className,
            {
              totalSeats: c.totalSeats || 0,
              availableSeats: c.availableSeats || 0,
              price: c.price || 0
            }
          ]) || []
        ),
        status: train.status || 'active',
        amenities: typeof train.amenities === 'string' ? 
          train.amenities.split(',').filter((a: string) => a.trim()) : [],
        createdAt: train.createdAt || new Date().toISOString(),
        updatedAt: train.updatedAt || new Date().toISOString(),
        routeFrom: undefined,
        routeTo: undefined,
        trainRouteVia: undefined,
        schedules: undefined,
        trainClasses: undefined
      };
    } catch (error) {
      console.error('Error formatting train:', error, train);
      return {
        id: train.id || '',
        name: train.name || '',
        number: train.number || '',
        route: {
          from: '',
          to: '',
          via: []
        },
        schedule: {
          departure: '',
          arrival: '',
          duration: ''
        },
        classes: {},
        status: 'active',
        amenities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        routeFrom: undefined,
        routeTo: undefined,
        trainRouteVia: undefined,
        schedules: undefined,
        trainClasses: undefined
      };
    }
  };

  const calculateDuration = (departure: string, arrival: string) => {
    if (!departure || !arrival) return '';
    try {
      const dep = new Date(`2000-01-01T${departure}`);
      const arr = new Date(`2000-01-01T${arrival}`);
      const diff = arr.getTime() - dep.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return '';
    }
  };

  const calculateAnalytics = () => {
    console.log("Starting analytics calculation...");
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

      const filteredBookings = bookings.filter(booking => {
        try {
          return (
            new Date(booking.bookingDate) >= cutoffDate &&
            booking.status === 'confirmed'
          );
        } catch {
          return false;
        }
      });

      console.log(`Filtered bookings: ${filteredBookings.length} out of ${bookings.length}`);

      // Revenue calculations
      const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const onlineRevenue = filteredBookings
        .filter(b => b.paymentMethod === 'online')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const manualRevenue = filteredBookings
        .filter(b => b.paymentMethod === 'manual')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      // Booking metrics
      const totalBookings = filteredBookings.length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Occupancy rate calculation
      const totalSeats = trains.reduce((sum, train) => 
        sum + Object.values(train.classes || {}).reduce((classSum, cls) => 
          classSum + (cls.totalSeats || 0), 0), 0
      );
      const bookedSeats = filteredBookings.reduce((sum, booking) => 
        sum + (booking.seats?.length || 0), 0);
      const occupancyRate = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

      // Popular routes
      const routeBookings = filteredBookings.reduce((acc, booking) => {
        try {
          const train = trains.find(t => t.id === booking.trainId);
          if (train) {
            const routeKey = `${train.route.from} → ${train.route.to}`;
            if (!acc[routeKey]) {
              acc[routeKey] = { bookings: 0, revenue: 0 };
            }
            acc[routeKey].bookings += 1;
            acc[routeKey].revenue += (booking.totalAmount || 0);
          }
          return acc;
        } catch {
          return acc;
        }
      }, {} as Record<string, { bookings: number; revenue: number }>);

      const popularRoutes = Object.entries(routeBookings)
        .map(([route, data]) => ({ route, ...data }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Peak booking hours
      const hourlyBookings = filteredBookings.reduce((acc, booking) => {
        try {
          const hour = new Date(booking.bookingDate).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        } catch {
          return acc;
        }
      }, {} as Record<number, number>);

      const peakHours = Object.entries(hourlyBookings)
        .map(([hour, bookings]) => ({ hour: parseInt(hour), bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 6);

      // Customer demographics
      const customerBookings = filteredBookings.reduce((acc, booking) => {
        try {
          const userBookings = bookings.filter(b => b.userId === booking.userId);
          if (userBookings.length === 1) {
            acc.newCustomers += 1;
          } else {
            acc.returningCustomers += 1;
          }
          return acc;
        } catch {
          return acc;
        }
      }, { newCustomers: 0, returningCustomers: 0 });

      // Driver performance
      const driverPerformance = drivers
        .filter(d => d.status === 'active')
        .map(driver => ({
          name: `${driver.firstName} ${driver.lastName}`,
          rating: driver.rating || 0,
          trips: driver.totalTrips || 0
        }))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

      // Route performance
      const routePerformance = routes
        .filter(r => r.isActive)
        .map(route => {
          const routeBookings = filteredBookings.filter(booking => {
            const train = trains.find(t => t.id === booking.trainId);
            return train && train.route.from === route.from && train.route.to === route.to;
          });
          
          const revenue = routeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          const totalCapacity = trains
            .filter(t => t.route.from === route.from && t.route.to === route.to)
            .reduce((sum, train) => 
              sum + Object.values(train.classes || {}).reduce((classSum, cls) => 
                classSum + (cls.totalSeats || 0), 0), 0
            );
          const bookedSeats = routeBookings.reduce((sum, booking) => 
            sum + (booking.seats?.length || 0), 0);
          const occupancy = totalCapacity > 0 ? (bookedSeats / totalCapacity) * 100 : 0;

          return {
            route: route.name,
            occupancy,
            revenue
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      console.log("Analytics calculation complete", {
        totalRevenue,
        totalBookings,
        popularRoutes,
        peakHours
      });

      setAnalytics({
        totalRevenue,
        onlineRevenue,
        manualRevenue,
        totalBookings,
        averageBookingValue,
        occupancyRate,
        popularRoutes,
        peakHours,
        customerDemographics: customerBookings,
        driverPerformance,
        routePerformance
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: `${dateRange} days`,
      analytics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
          <p className="mt-2 text-gray-600">No booking data available</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Online: ${analytics.onlineRevenue.toLocaleString()} | 
                  Manual: ${analytics.manualRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: ${analytics.averageBookingValue.toFixed(2)} per booking
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.occupancyRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Seat utilization</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trains</p>
                <p className="text-2xl font-bold text-gray-900">{trains.filter(t => t.status === 'active').length}</p>
                <p className="text-xs text-gray-500 mt-1">In service</p>
              </div>
              <Train className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Routes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Popular Routes</h3>
            </div>
            <div className="space-y-3">
              {analytics.popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{route.route}</p>
                    <p className="text-sm text-gray-600">{route.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${route.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Booking Hours */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Peak Booking Hours</h3>
            </div>
            <div className="space-y-3">
              {analytics.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {hour.hour.toString().padStart(2, '0')}:00 - {(hour.hour + 1).toString().padStart(2, '0')}:00
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(hour.bookings / Math.max(...analytics.peakHours.map(h => h.bookings))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{hour.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Customer Demographics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Customer Demographics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Customers</span>
                <span className="font-semibold text-gray-900">{analytics.customerDemographics.newCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Returning Customers</span>
                <span className="font-semibold text-gray-900">{analytics.customerDemographics.returningCustomers}</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full" 
                    style={{ 
                      width: `${(analytics.customerDemographics.returningCustomers / 
                        Math.max(1, analytics.customerDemographics.newCustomers + analytics.customerDemographics.returningCustomers)) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((analytics.customerDemographics.returningCustomers / 
                    Math.max(1, analytics.customerDemographics.newCustomers + analytics.customerDemographics.returningCustomers)) * 100).toFixed(1)}% 
                  returning customers
                </p>
              </div>
            </div>
          </div>

          {/* Driver Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Drivers</h3>
            </div>
            <div className="space-y-3">
              {analytics.driverPerformance.map((driver, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.trips} trips</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">{driver.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Route Performance</h3>
            </div>
            <div className="space-y-3">
              {analytics.routePerformance.map((route, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{route.route}</p>
                    <span className="text-sm font-semibold text-gray-900">${route.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(route.occupancy, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{route.occupancy.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;