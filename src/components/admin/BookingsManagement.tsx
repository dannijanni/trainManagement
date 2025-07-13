import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MoreHorizontal,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Booking, Train, User } from '../../types';

const BookingsManagement: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const loadData = () => {
    const bookingsData = LocalStorageManager.getBookings();
    const trainsData = LocalStorageManager.getTrains();
    const usersData = LocalStorageManager.getUsers();
    
    setBookings(bookingsData);
    setTrains(trainsData);
    setUsers(usersData);
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengerDetails.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(booking => 
        booking.travelDate.startsWith(dateFilter)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'waitlisted': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainName = (trainId: string) => {
    const train = trains.find(t => t.id === trainId);
    return train ? `${train.name} (${train.number})` : 'Unknown Train';
  };

  const getUserName = (userId: string) => {
    const userData = users.find(u => u.id === userId);
    return userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown User';
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBookings(
      selectedBookings.length === filteredBookings.length 
        ? [] 
        : filteredBookings.map(b => b.id)
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedBookings.length === 0) return;

    const updatedBookings = bookings.map(booking => {
      if (selectedBookings.includes(booking.id)) {
        switch (action) {
          case 'confirm':
            return { ...booking, status: 'confirmed' as const };
          case 'cancel':
            return { ...booking, status: 'cancelled' as const };
          default:
            return booking;
        }
      }
      return booking;
    });

    setBookings(updatedBookings);
    LocalStorageManager.saveBookings(updatedBookings);
    setSelectedBookings([]);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'bulk_booking_update',
      `Updated ${selectedBookings.length} bookings with action: ${action}`
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setCancellingBooking(booking);
      setRefundAmount(booking.totalAmount.toString());
      setShowCancelModal(true);
    }
  };

  const processCancellation = () => {
    if (!cancellingBooking) return;

    const updatedBookings = bookings.map(booking =>
      booking.id === cancellingBooking.id 
        ? { 
            ...booking, 
            status: 'cancelled' as const,
            cancellationReason: cancelReason,
            cancellationDate: new Date().toISOString(),
            refundAmount: parseFloat(refundAmount),
            refundStatus: 'pending' as const,
            refundProcessedBy: user?.id
          }
        : booking
    );
    
    setBookings(updatedBookings);
    LocalStorageManager.saveBookings(updatedBookings);
    
    // Update train seat availability
    const trains = LocalStorageManager.getTrains();
    const trainIndex = trains.findIndex(t => t.id === cancellingBooking.trainId);
    if (trainIndex !== -1) {
      cancellingBooking.seats.forEach(seat => {
        if (trains[trainIndex].classes[seat.class]) {
          trains[trainIndex].classes[seat.class].availableSeats += 1;
        }
      });
      LocalStorageManager.saveTrains(trains);
    }
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'booking_cancelled',
      `Cancelled booking ${cancellingBooking.id} with refund $${refundAmount}`
    );
    
    resetCancelModal();
  };

  const resetCancelModal = () => {
    setCancellingBooking(null);
    setCancelReason('');
    setRefundAmount('');
    setShowCancelModal(false);
  };

  const processRefund = (bookingId: string) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId 
        ? { ...booking, refundStatus: 'processed' as const }
        : booking
    );
    
    setBookings(updatedBookings);
    LocalStorageManager.saveBookings(updatedBookings);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'refund_processed',
      `Processed refund for booking ${bookingId}`
    );
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Train', 'Passenger', 'Travel Date', 'Status', 'Amount'].join(','),
      ...filteredBookings.map(booking => [
        booking.id,
        getTrainName(booking.trainId),
        booking.passengerDetails[0]?.name || '',
        booking.travelDate,
        booking.status,
        booking.totalAmount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all customer bookings and reservations</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="completed">Completed</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <button
                onClick={exportBookings}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => window.location.hash = '#admin-booking'}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Admin Booking
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedBookings.length} booking(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('confirm')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleBulkAction('cancel')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travel Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{booking.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTrainName(booking.trainId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.passengerDetails[0]?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.passengerDetails.length} passenger(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.travelDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingBooking(booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingBooking(booking)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {booking.status === 'cancelled' && booking.refundStatus === 'pending' && (
                          <button
                            onClick={() => processRefund(booking.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Process Refund"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>

        {/* View Booking Modal */}
        {viewingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Booking Details - #{viewingBooking.id.slice(0, 8)}
                  </h2>
                  <button
                    onClick={() => setViewingBooking(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Train</label>
                      <p className="mt-1 text-sm text-gray-900">{getTrainName(viewingBooking.trainId)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(viewingBooking.travelDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusIcon(viewingBooking.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingBooking.status)}`}>
                          {viewingBooking.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="mt-1 text-sm font-semibold text-gray-900">${viewingBooking.totalAmount}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Passengers</label>
                    <div className="space-y-2">
                      {viewingBooking.passengerDetails.map((passenger, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{passenger.name}</p>
                              <p className="text-sm text-gray-600">{passenger.age} years, {passenger.gender}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{passenger.email}</p>
                              <p className="text-sm text-gray-600">{passenger.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Seats</label>
                    <div className="flex flex-wrap gap-2">
                      {viewingBooking.seats.map((seat, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {seat.seatNumber} ({seat.class}) - ${seat.price}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && cancellingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Cancel Booking #{cancellingBooking.id.slice(0, 8)}
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Original Amount:</strong> ${cancellingBooking.totalAmount}
                    </p>
                    <p className="text-sm text-yellow-800">
                      <strong>Travel Date:</strong> {new Date(cancellingBooking.travelDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cancellation Reason
                    </label>
                    <textarea
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter reason for cancellation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      max={cancellingBooking.totalAmount}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-800">
                      This action will cancel the booking and initiate a refund process. 
                      The seats will be made available for other customers.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={resetCancelModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processCancellation}
                    disabled={!cancelReason.trim() || !refundAmount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Process Cancellation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsManagement;