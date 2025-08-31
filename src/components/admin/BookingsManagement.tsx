import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Edit2,
  PoundSterling
} from 'lucide-react';
import axios from 'axios';
import { Booking} from '../../types';
import { Base_URL } from '../../config';

const BookingsManagement: React.FC = () => {
  // const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${Base_URL}/booking/GetAllbookings`);
      const formattedBookings = response.data.$values.map((booking: any) => ({
        id: booking.id,
        trainId: booking.trainId,
        userId: booking.userId,
        passengerDetails: booking.passengers.$values.map((passenger: any) => ({
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          email: passenger.email,
          phone: passenger.phone,
        })),
        seats: booking.bookingSeats.$values.map((seat: any) => ({
          class: seat.class,
          seatNumber: seat.seatNumber,
          price: seat.price,
        })),
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        paymentId: booking.paymentId,
        bookingDate: booking.bookingDate,
        travelDate: booking.travelDate,
        qrCode: booking.qrcode,
        cancellationReason: booking.cancellationReason,
        cancellationDate: booking.cancellationDate,
        refundAmount: booking.refundAmount,
        refundStatus: booking.refundStatus,
        refundProcessedBy: booking.refundProcessedBy,
        createdBy: booking.createdBy,
        notes: booking.notes,
        specialBookingCode: booking.specialBookingCode,
        isAdminBooking: booking.isAdminBooking,
      }));
      setBookings(formattedBookings);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings');
      setLoading(false);
      console.error('Error fetching bookings:', err);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;
    if (searchTerm) {
      filtered = filtered.filter((booking) =>
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengerDetails.some((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter((booking) =>
        booking.travelDate.startsWith(dateFilter)
      );
    }
    setFilteredBookings(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'waitlisted':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBookings(
      selectedBookings.length === filteredBookings.length
        ? []
        : filteredBookings.map((b) => b.id)
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setCancellingBooking(booking);
      setRefundAmount(booking.totalAmount.toString());
      setShowCancelModal(true);
    }
  };

  const processCancellation = async () => {
    if (!cancellingBooking) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.patch(
        `${Base_URL}/booking/${cancellingBooking.id}`
      );
      if (response.status === 200) {
        setSuccessMessage('Booking cancelled successfully');
        const updatedBookings = bookings.map((booking) =>
          booking.id === cancellingBooking.id
            ? {
                ...booking,
                status: 'cancelled' as Booking['status'],
                cancellationReason: cancelReason,
                cancellationDate: new Date().toISOString(),
                refundAmount: parseFloat(refundAmount),
                refundStatus: 'pending' as 'pending' | 'processed' | 'failed' | undefined,
              }
            : booking
        );
        setBookings(updatedBookings as Booking[]);
        resetCancelModal();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const resetCancelModal = () => {
    setCancellingBooking(null);
    setCancelReason('');
    setRefundAmount('');
    setShowCancelModal(false);
  };

  const processRefund = async (bookingId: string) => {
    try {
      setLoading(true);
      setError('');
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, refundStatus: 'processed' }
          : booking
      );
      setBookings(updatedBookings as Booking[]);
      setSuccessMessage('Refund processed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error processing refund:', err);
      setError('Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const processEdit = async () => {
    if (!editingBooking) return;
    try {
      setLoading(true);
      setError('');

      const payload = {
        trainId: editingBooking.trainId,
        userId: editingBooking.userId,
        passengerDetails: editingBooking.passengerDetails,
        seats: editingBooking.seats,
        totalAmount: editingBooking.totalAmount,
        status: editingBooking.status,
        paymentStatus: editingBooking.paymentStatus,
        paymentMethod: editingBooking.paymentMethod,
        paymentDetails: {
          method: editingBooking.paymentMethod,
          transactionId: editingBooking.paymentId,
          cashierName: "",
          counterLocation: "",
          deferralReason: "",
          paymentDeadline: "",
        },
        paymentId: editingBooking.paymentId,
        bookingDate: editingBooking.bookingDate,
        travelDate: editingBooking.travelDate,
        qrCode: editingBooking.qrCode,
        createdBy: editingBooking.createdBy,
        notes: editingBooking.notes,
        specialBookingCode: editingBooking.specialBookingCode,
        isAdminBooking: editingBooking.isAdminBooking,
      };

      const response = await axios.put(
        `http://localhost:5049/api/booking/updateByID?id=${editingBooking.id}`,
        payload
      );

      if (response.status === 200) {
        const updatedBookings = bookings.map((booking) =>
          booking.id === editingBooking.id ? { ...editingBooking, ...response.data } : booking
        );
        setBookings(updatedBookings as Booking[]);
        setSuccessMessage('Booking updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error editing booking:', err);
      setError('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Train ID', 'Passenger', 'Travel Date', 'Status', 'Amount'].join(','),
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.trainId,
        booking.passengerDetails[0]?.name || '',
        booking.travelDate,
        booking.status,
        booking.totalAmount,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !showCancelModal && !showEditModal) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error && !bookings.length) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all customer bookings and reservations</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

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
            </div>
          </div>
        </div>

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
                    Train ID
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
                        {booking.trainId.slice(0, 8)}
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
                      £{booking.totalAmount}
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
                          onClick={() => handleEditBooking(booking)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Booking"
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
                            <PoundSterling className="h-4 w-4" />
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
                      <label className="block text-sm font-medium text-gray-700">Train ID</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingBooking.trainId}</p>
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
                      <p className="mt-1 text-sm font-semibold text-gray-900">£{viewingBooking.totalAmount}</p>
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
                          {seat.seatNumber} ({seat.class}) - £{seat.price}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      <strong>Original Amount:</strong> £{cancellingBooking.totalAmount}
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
                      Refund Amount (£)
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
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processCancellation}
                    disabled={!cancelReason.trim() || !refundAmount || loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Edit Booking #{editingBooking.id.slice(0, 8)}
                </h2>
                <div className="space-y-6">
                  {/* Train ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Train ID
                    </label>
                    <input
                      type="text"
                      value={editingBooking.trainId}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, trainId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={editingBooking.userId}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, userId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Travel Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Travel Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editingBooking.travelDate.replace(' ', 'T')}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, travelDate: e.target.value.replace('T', ' ') })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editingBooking.status}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, status: e.target.value as Booking['status'] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Total Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={editingBooking.totalAmount}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, totalAmount: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Passenger Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Passenger Details
                    </label>
                    {editingBooking.passengerDetails.map((passenger, index) => (
                      <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={passenger.name}
                              onChange={(e) => {
                                const updatedPassengers = [...editingBooking.passengerDetails];
                                updatedPassengers[index].name = e.target.value;
                                setEditingBooking({ ...editingBooking, passengerDetails: updatedPassengers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              value={passenger.age}
                              onChange={(e) => {
                                const updatedPassengers = [...editingBooking.passengerDetails];
                                updatedPassengers[index].age = parseInt(e.target.value);
                                setEditingBooking({ ...editingBooking, passengerDetails: updatedPassengers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <input
                              type="text"
                              value={passenger.gender}
                              onChange={(e) => {
                                const updatedPassengers = [...editingBooking.passengerDetails];
                                updatedPassengers[index].gender = e.target.value as 'male' | 'female' | 'other';
                                setEditingBooking({ ...editingBooking, passengerDetails: updatedPassengers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={passenger.email}
                              onChange={(e) => {
                                const updatedPassengers = [...editingBooking.passengerDetails];
                                updatedPassengers[index].email = e.target.value;
                                setEditingBooking({ ...editingBooking, passengerDetails: updatedPassengers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={passenger.phone}
                              onChange={(e) => {
                                const updatedPassengers = [...editingBooking.passengerDetails];
                                updatedPassengers[index].phone = e.target.value;
                                setEditingBooking({ ...editingBooking, passengerDetails: updatedPassengers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seats */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Seats
                    </label>
                    {editingBooking.seats.map((seat, index) => (
                      <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Seat Number
                            </label>
                            <input
                              type="text"
                              value={seat.seatNumber}
                              onChange={(e) => {
                                const updatedSeats = [...editingBooking.seats];
                                updatedSeats[index].seatNumber = e.target.value;
                                setEditingBooking({ ...editingBooking, seats: updatedSeats });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Class
                            </label>
                            <input
                              type="text"
                              value={seat.class}
                              onChange={(e) => {
                                const updatedSeats = [...editingBooking.seats];
                                updatedSeats[index].class = e.target.value;
                                setEditingBooking({ ...editingBooking, seats: updatedSeats });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price
                            </label>
                            <input
                              type="number"
                              value={seat.price}
                              onChange={(e) => {
                                const updatedSeats = [...editingBooking.seats];
                                updatedSeats[index].price = parseFloat(e.target.value);
                                setEditingBooking({ ...editingBooking, seats: updatedSeats });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <input
                      type="text"
                      value={editingBooking.paymentMethod}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, paymentMethod: e.target.value as Booking['paymentMethod'] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Payment ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={editingBooking.paymentId}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, paymentId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingBooking.notes || ''}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>

                  {/* Special Booking Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Booking Code
                    </label>
                    <input
                      type="text"
                      value={editingBooking.specialBookingCode || ''}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, specialBookingCode: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Is Admin Booking */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingBooking.isAdminBooking}
                      onChange={(e) =>
                        setEditingBooking({ ...editingBooking, isAdminBooking: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">
                      Is Admin Booking
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processEdit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
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
