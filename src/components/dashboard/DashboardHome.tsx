import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Users, 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  AlertCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Train as TrainType, Booking, User, Analytics } from '../../types';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    trains: 0,
    bookings: 0,
    users: 0,
    revenue: 0,
    myBookings: 0,
    upcomingTrains: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [upcomingTrains, setUpcomingTrains] = useState<TrainType[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = () => {
    const trains = LocalStorageManager.getTrains();
    const bookings = LocalStorageManager.getBookings();
    const users = LocalStorageManager.getUsers();
    const analytics = LocalStorageManager.getAnalytics();

    if (user?.role === 'customer') {
      const myBookings = bookings.filter(b => b.userId === user.id);
      const upcomingTrains = trains.filter(t => t.status === 'active').slice(0, 3);
      
      setStats({
        trains: trains.length,
        bookings: bookings.length,
        users: users.length,
        revenue: analytics.totalRevenue,
        myBookings: myBookings.length,
        upcomingTrains: upcomingTrains.length
      });
      setRecentBookings(myBookings.slice(-3));
      setUpcomingTrains(upcomingTrains);
    } else {
      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      
      setStats({
        trains: trains.length,
        bookings: bookings.length,
        users: users.length,
        revenue: totalRevenue,
        myBookings: 0,
        upcomingTrains: 0
      });
      setRecentBookings(bookings.slice(-5));
      setUpcomingTrains(trains.filter(t => t.status === 'active').slice(0, 5));
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';
    
    return `${greeting}, ${user?.firstName}!`;
  };

  const StatsCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role === 'customer') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
            <p className="text-gray-600 mt-2">Welcome back to your TrainWay dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="My Bookings"
              value={stats.myBookings}
              icon={Ticket}
              color="bg-blue-500"
            />
            <StatsCard
              title="Upcoming Trains"
              value={stats.upcomingTrains}
              icon={Train}
              color="bg-green-500"
            />
            <StatsCard
              title="Available Routes"
              value={stats.trains}
              icon={MapPin}
              color="bg-purple-500"
            />
            <StatsCard
              title="Quick Book"
              value="Search"
              icon={Clock}
              color="bg-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Bookings</h3>
              <div className="space-y-3">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Booking #{booking.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">{booking.travelDate}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">${booking.totalAmount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings yet</p>
                    <p className="text-sm">Start by searching for trains</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Routes</h3>
              <div className="space-y-3">
                {upcomingTrains.map((train) => (
                  <div key={train.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{train.name}</p>
                      <p className="text-sm text-gray-600">{train.route.from} → {train.route.to}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{train.schedule.departure}</p>
                      <p className="text-xs text-gray-500">{train.schedule.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your train system today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Trains"
            value={stats.trains}
            icon={Train}
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Bookings"
            value={stats.bookings}
            icon={Ticket}
            color="bg-green-500"
          />
          <StatsCard
            title="Total Users"
            value={stats.users}
            icon={Users}
            color="bg-purple-500"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Booking #{booking.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">{booking.travelDate}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">${booking.totalAmount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Trains</span>
                <span className="text-sm font-medium text-green-600">{upcomingTrains.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;