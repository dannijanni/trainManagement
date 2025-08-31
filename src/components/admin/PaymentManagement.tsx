import React, { useState, useEffect } from 'react';
import { 
  CreditCard,  
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Receipt,
  PoundSterling
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Booking, Payment, CashCollection, Train, User as UserType } from '../../types';

const PaymentManagement: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashCollections, setCashCollections] = useState<CashCollection[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [showCashCollectionModal, setShowCashCollectionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    bookingId: '',
    amount: '',
    method: 'cash' as 'cash' | 'card',
    counterLocation: '',
    notes: ''
  });
  const [cashCollectionForm, setCashCollectionForm] = useState({
    counterLocation: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, paymentMethodFilter, statusFilter]);

  const loadData = () => {
    const bookingsData = LocalStorageManager.getBookings();
    const paymentsData = LocalStorageManager.getPayments();
    const cashCollectionsData = LocalStorageManager.getCashCollections();
    const trainsData = LocalStorageManager.getTrains();
    const usersData = LocalStorageManager.getUsers();
    
    setBookings(bookingsData);
    setPayments(paymentsData);
    setCashCollections(cashCollectionsData);
    setTrains(trainsData);
    setUsers(usersData);
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengerDetails.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentMethod === paymentMethodFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const booking = bookings.find(b => b.id === manualPaymentForm.bookingId);
    if (!booking) return;

    // Create payment record
    const payment: Payment = {
      id: Date.now().toString(),
      bookingId: booking.id,
      amount: parseFloat(manualPaymentForm.amount),
      method: manualPaymentForm.method,
      status: 'completed',
      paymentDate: new Date().toISOString(),
      processedBy: user?.id,
      counterLocation: manualPaymentForm.counterLocation,
      notes: manualPaymentForm.notes
    };

    // Update booking
    const updatedBookings = bookings.map(b =>
      b.id === booking.id
        ? {
            ...b,
            paymentStatus: 'completed' as const,
            paymentMethod: 'manual' as const,
            paymentDetails: {
              method: manualPaymentForm.method,
              cashierName: `${user?.firstName} ${user?.lastName}`,
              counterLocation: manualPaymentForm.counterLocation
            }
          }
        : b
    );

    const updatedPayments = [...payments, payment];

    setBookings(updatedBookings);
    setPayments(updatedPayments);
    LocalStorageManager.saveBookings(updatedBookings);
    LocalStorageManager.savePayments(updatedPayments);

    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'manual_payment_processed',
      `Processed manual payment for booking ${booking.id}`
    );

    resetManualPaymentForm();
  };

  const handleCashCollection = (e: React.FormEvent) => {
    e.preventDefault();
    
    const todayBookings = bookings.filter(b => 
      b.paymentMethod === 'manual' && 
      b.paymentStatus === 'completed' &&
      new Date(b.bookingDate).toDateString() === new Date().toDateString()
    );

    const totalAmount = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const collection: CashCollection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      cashierName: `${user?.firstName} ${user?.lastName}`,
      counterLocation: cashCollectionForm.counterLocation,
      totalAmount,
      bookingIds: todayBookings.map(b => b.id),
      startTime: cashCollectionForm.startTime,
      endTime: cashCollectionForm.endTime,
      notes: cashCollectionForm.notes
    };

    const updatedCollections = [...cashCollections, collection];
    setCashCollections(updatedCollections);
    LocalStorageManager.saveCashCollections(updatedCollections);

    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'cash_collection_recorded',
      `Recorded cash collection: $${totalAmount}`
    );

    resetCashCollectionForm();
  };

  const resetManualPaymentForm = () => {
    setManualPaymentForm({
      bookingId: '',
      amount: '',
      method: 'cash',
      counterLocation: '',
      notes: ''
    });
    setSelectedBooking(null);
    setShowManualPaymentModal(false);
  };

  const resetCashCollectionForm = () => {
    setCashCollectionForm({
      counterLocation: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
    setShowCashCollectionModal(false);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'online': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'manual': return <Receipt className="h-4 w-4 text-green-500" />;
      case 'deferred': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <PoundSterling className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
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

  const openManualPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setManualPaymentForm({
      bookingId: booking.id,
      amount: booking.totalAmount.toString(),
      method: 'cash',
      counterLocation: '',
      notes: ''
    });
    setShowManualPaymentModal(true);
  };

  const totalOnlineRevenue = bookings
    .filter(b => b.paymentMethod === 'online' && b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalManualRevenue = bookings
    .filter(b => b.paymentMethod === 'manual' && b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalDeferredRevenue = bookings
    .filter(b => b.paymentMethod === 'deferred')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Manage online and manual payments</p>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Revenue</p>
                <p className="text-2xl font-bold text-blue-600">${totalOnlineRevenue.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manual Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalManualRevenue.toLocaleString()}</p>
              </div>
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deferred Payments</p>
                <p className="text-2xl font-bold text-yellow-600">${totalDeferredRevenue.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalOnlineRevenue + totalManualRevenue).toLocaleString()}
                </p>
              </div>
              <PoundSterling className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="online">Online</option>
                <option value="manual">Manual</option>
                <option value="deferred">Deferred</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <>
                  <button
                    onClick={() => setShowManualPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Manual Payment
                  </button>
                  
                  <button
                    onClick={() => setShowCashCollectionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Receipt className="h-4 w-4" />
                    Cash Collection
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(booking.paymentMethod || 'online')}
                        <span className="text-sm text-gray-900">
                          {booking.paymentMethod || 'online'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(booking.paymentStatus)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.paymentStatus === 'pending' && (user?.role === 'admin' || user?.role === 'manager') && (
                        <button
                          onClick={() => openManualPaymentModal(booking)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Process Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Payment Modal */}
      {showManualPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Process Manual Payment
              </h2>
              
              <form onSubmit={handleManualPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    value={manualPaymentForm.bookingId}
                    onChange={(e) => setManualPaymentForm(prev => ({ ...prev, bookingId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter booking ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={manualPaymentForm.amount}
                    onChange={(e) => setManualPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={manualPaymentForm.method}
                    onChange={(e) => setManualPaymentForm(prev => ({ ...prev, method: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card (Counter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Counter Location
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPaymentForm.counterLocation}
                    onChange={(e) => setManualPaymentForm(prev => ({ ...prev, counterLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Main Station Counter 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={manualPaymentForm.notes}
                    onChange={(e) => setManualPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetManualPaymentForm}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Process Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cash Collection Modal */}
      {showCashCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Record Cash Collection
              </h2>
              
              <form onSubmit={handleCashCollection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Counter Location
                  </label>
                  <input
                    type="text"
                    required
                    value={cashCollectionForm.counterLocation}
                    onChange={(e) => setCashCollectionForm(prev => ({ ...prev, counterLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Main Station Counter 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={cashCollectionForm.startTime}
                      onChange={(e) => setCashCollectionForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={cashCollectionForm.endTime}
                      onChange={(e) => setCashCollectionForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={cashCollectionForm.notes}
                    onChange={(e) => setCashCollectionForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This will record all cash payments made today at the specified counter.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetCashCollectionForm}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Record Collection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;