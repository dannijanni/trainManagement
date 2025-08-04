import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LocalStorageManager from './utils/localStorage';
import AuthPage from './components/auth/AuthPage';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import DashboardHome from './components/dashboard/DashboardHome';
import TrainManagement from './components/dashboard/TrainManagement';
import BookingsManagement from './components/admin/BookingsManagement';
import RoutesManagement from './components/admin/RoutesManagement';
import ScheduleManagement from './components/admin/ScheduleManagement';
import UserManagement from './components/admin/UserManagement';
import SystemSettings from './components/admin/SystemSettings';
import DriverManagement from './components/admin/DriverManagement';
// import PaymentManagement from './components/admin/PaymentManagement';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import TrainSearch from './components/customer/TrainSearch';
import BookingForm from './components/customer/BookingForm';
import BookingSuccess from './components/common/BookingSuccess';
import AdminBookingForm from './components/admin/AdminBookingForm';
import MyBookings from './components/customer/MyBookings';
import { Train, Booking } from './types';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [bookingResult, setBookingResult] = useState<{
    booking: Booking;
    train: Train;
  } | null>(null);
  const [showAdminBooking, setShowAdminBooking] = useState(false);

  useEffect(() => {
    // Initialize data when app loads
    LocalStorageManager.initializeData();
  }, []);

  const handleBookTrain = (train: Train, trainClass: string) => {
    setSelectedTrain(train);
    setSelectedClass(trainClass);
    setActiveTab('booking');
  };

  const handleBookingComplete = (booking: Booking) => {
    if (selectedTrain) {
      setBookingResult({ booking, train: selectedTrain });
      setActiveTab('success');
    }
  };

  const handleBackToSearch = () => {
    setSelectedTrain(null);
    setSelectedClass('');
    setActiveTab('search');
  };

  const handleContinueAfterBooking = () => {
    setBookingResult(null);
    setSelectedTrain(null);
    setSelectedClass('');
    setShowAdminBooking(false);
    setActiveTab('dashboard');
  };

  const handleBackFromAdminBooking = () => {
    setShowAdminBooking(false);
    setActiveTab('bookings-admin');
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'trains':
        return <TrainManagement />;
      case 'routes':
        return <RoutesManagement />;
      case 'schedules':
        return <ScheduleManagement />;
      case 'bookings-admin':
        return <BookingsManagement />;
      case 'drivers':
        return <DriverManagement />;
      // case 'payments':
      //   return <PaymentManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'search':
        return <TrainSearch onBookTrain={handleBookTrain} />;
      case 'booking':
        return selectedTrain ? (
          <BookingForm
            train={selectedTrain}
            selectedClass={selectedClass}
            onBack={handleBackToSearch}
            onBookingComplete={handleBookingComplete} travelDate={''}          />
        ) : (
          <TrainSearch onBookTrain={handleBookTrain} />
        );
      case 'success':
        return bookingResult ? (
          <BookingSuccess
            booking={bookingResult.booking}
            train={bookingResult.train}
            onContinue={handleContinueAfterBooking}
          />
        ) : (
          <DashboardHome />
        );
      case 'bookings':
        return (
          <MyBookings />
        );
      case 'admin-booking':
        return (
          <AdminBookingForm
            onBack={handleBackFromAdminBooking}
            onBookingComplete={handleBookingComplete}
          />
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;