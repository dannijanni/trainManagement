import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Train, 
  MapPin, 
  Clock, 
  Users, 
  CreditCard,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Booking, Train as TrainType } from '../../types';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const loadBookings = () => {
    if (!user) return;
    
    const allBookings = LocalStorageManager.getBookings();
    const allTrains = LocalStorageManager.getTrains();
    
    const userBookings = allBookings.filter(booking => booking.userId === user.id);
    setBookings(userBookings);
    setTrains(allTrains);
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sort by booking date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    setFilteredBookings(filtered);
  };

  const getTrainInfo = (trainId: string) => {
    return trains.find(train => train.id === trainId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }
    
    const travelDate = new Date(booking.travelDate);
    const now = new Date();
    const hoursUntilTravel = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can cancel if more than 2 hours before travel
    return hoursUntilTravel > 2;
  };

  const handleCancelBooking = (booking: Booking) => {
    setCancellingBooking(booking);
    setShowCancelModal(true);
  };

  const processCancellation = () => {
    if (!cancellingBooking || !cancelReason.trim()) return;

    const settings = LocalStorageManager.getSystemSettings();
    const refundPercentage = settings.bookingRules.refundPercentage;
    const refundAmount = (cancellingBooking.totalAmount * refundPercentage) / 100;

    const updatedBookings = bookings.map(booking =>
      booking.id === cancellingBooking.id 
        ? { 
            ...booking, 
            status: 'cancelled' as const,
            cancellationReason: cancelReason,
            cancellationDate: new Date().toISOString(),
            refundAmount,
            refundStatus: 'pending' as const
          }
        : booking
    );
    
    setBookings(updatedBookings);
    
    // Update in localStorage
    const allBookings = LocalStorageManager.getBookings();
    const updatedAllBookings = allBookings.map(booking =>
      booking.id === cancellingBooking.id 
        ? updatedBookings.find(b => b.id === booking.id) || booking
        : booking
    );
    LocalStorageManager.saveBookings(updatedAllBookings);
    
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
    
    resetCancelModal();
  };

  const resetCancelModal = () => {
    setCancellingBooking(null);
    setCancelReason('');
    setShowCancelModal(false);
  };

  const downloadTicket = (booking: Booking) => {
    // This would integrate with the existing ticket download functionality
    console.log('Download ticket for booking:', booking.id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your train reservations</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const train = getTrainInfo(booking.trainId);
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Booking #{booking.id.slice(0, 8)}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(booking.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${booking.totalAmount}</p>
                        <p className="text-sm text-gray-600">{booking.seats.length} passenger(s)</p>
                      </div>
                    </div>

                    {train && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Train className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{train.name}</p>
                            <p className="text-xs text-gray-600">{train.number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {train.route.from} → {train.route.to}
                            </p>
                            <p className="text-xs text-gray-600">Route</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(booking.travelDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">Travel Date</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {train.schedule.departure} - {train.schedule.arrival}
                            </p>
                            <p className="text-xs text-gray-600">Timing</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Seat Details</h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats.map((seat, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {seat.seatNumber} ({seat.class})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Passengers</h4>
                      <div className="space-y-1">
                        {booking.passengerDetails.map((passenger, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {passenger.name} ({passenger.age} years, {passenger.gender})
                          </p>
                        ))}
                      </div>
                    </div>

                    {booking.status === 'cancelled' && booking.cancellationReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                        </p>
                        {booking.refundAmount && (
                          <p className="text-sm text-red-800 mt-1">
                            <strong>Refund Amount:</strong> ${booking.refundAmount} 
                            <span className="ml-2 text-xs">({booking.refundStatus})</span>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setViewingBooking(booking)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => downloadTicket(booking)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download Ticket
                        </button>
                      )}
                      
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bookings found</p>
              <p className="text-sm text-gray-400 mt-2">
                {statusFilter !== 'all' ? 'Try changing the filter' : 'Start by searching for trains'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && cancellingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cancel Booking
              </h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Booking:</strong> #{cancellingBooking.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Amount:</strong> ${cancellingBooking.totalAmount}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Refund:</strong> ${((cancellingBooking.totalAmount * 80) / 100).toFixed(2)} (80%)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Cancellation
                  </label>
                  <textarea
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Please provide a reason for cancellation..."
                  />
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    This action cannot be undone. Your booking will be cancelled and a refund will be processed according to our cancellation policy.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={resetCancelModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={processCancellation}
                  disabled={!cancelReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <label className="block text-sm font-medium text-gray-700">Booking Status</label>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusIcon(viewingBooking.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingBooking.status)}`}>
                        {viewingBooking.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">${viewingBooking.totalAmount}</p>
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

                {viewingBooking.paymentDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Method:</strong> {viewingBooking.paymentDetails.method}
                      </p>
                      {viewingBooking.paymentDetails.counterLocation && (
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {viewingBooking.paymentDetails.counterLocation}
                        </p>
                      )}
                      {viewingBooking.paymentDetails.cashierName && (
                        <p className="text-sm text-gray-600">
                          <strong>Processed by:</strong> {viewingBooking.paymentDetails.cashierName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;