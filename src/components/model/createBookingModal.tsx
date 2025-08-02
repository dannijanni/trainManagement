import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { getAllTrains } from '../../services/trainAPI';
import { Train, User, Booking } from '../../types/index'; // Adjust the import path as necessary

interface CreateBookingModalProps {
  showCreateModal: boolean;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateBooking: (bookingData: Omit<Booking, 'id'>) => void;
  users: User[];
  user: User | null;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  showCreateModal,
  setShowCreateModal,
  handleCreateBooking,
  users,
  user,
}) => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<Omit<Booking, 'id'>>({
    trainId: '',
    userId: '',
    passengerDetails: [{
      name: '',
      age: 0,
      gender: 'male',
      email: '',
      phone: '',
    }],
    seats: [{
      class: 'Economy',
      seatNumber: '',
      price: 0,
    }],
    passengers: [], // Added missing property
    bookingSeats: [], // Added missing property
    totalAmount: 0,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'online',
    paymentDetails: {
      method: 'card',
    },
    bookingDate: new Date().toISOString(),
    travelDate: new Date().toISOString(),
    qrCode: '',
    createdBy: user?.id || '',
    notes: '',
    specialBookingCode: '',
    isAdminBooking: true,
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const trainsData = await getAllTrains();
        setTrains(trainsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trains:', error);
        setError('Failed to fetch trains');
        setLoading(false);
      }
    };

    if (showCreateModal) {
      fetchTrains();
    }
  }, [showCreateModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateBooking(bookingData);
    setShowCreateModal(false);
  };

  if (!showCreateModal) return null;

  if (loading) return <div>Loading trains...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Booking</h2>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Train</label>
                <select
                  name="trainId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleChange}
                  value={bookingData.trainId}
                >
                  <option value="">Select Train</option>
                  {trains.map(train => (
                    <option key={train.id} value={train.id}>{train.name} ({train.number})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  name="userId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleChange}
                  value={bookingData.userId}
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                  ))}
                </select>
              </div>
              {/* Additional form fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Name</label>
                <input
                  type="text"
                  name="passengerName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newPassengerDetails = [...bookingData.passengerDetails];
                    newPassengerDetails[0].name = e.target.value;
                    setBookingData(prev => ({ ...prev, passengerDetails: newPassengerDetails }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Age</label>
                <input
                  type="number"
                  name="passengerAge"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newPassengerDetails = [...bookingData.passengerDetails];
                    newPassengerDetails[0].age = parseInt(e.target.value);
                    setBookingData(prev => ({ ...prev, passengerDetails: newPassengerDetails }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Gender</label>
                <select
                  name="passengerGender"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newPassengerDetails = [...bookingData.passengerDetails];
                    newPassengerDetails[0].gender = e.target.value as 'male' | 'female' | 'other';
                    setBookingData(prev => ({ ...prev, passengerDetails: newPassengerDetails }));
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Email</label>
                <input
                  type="email"
                  name="passengerEmail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newPassengerDetails = [...bookingData.passengerDetails];
                    newPassengerDetails[0].email = e.target.value;
                    setBookingData(prev => ({ ...prev, passengerDetails: newPassengerDetails }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Phone</label>
                <input
                  type="text"
                  name="passengerPhone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newPassengerDetails = [...bookingData.passengerDetails];
                    newPassengerDetails[0].phone = e.target.value;
                    setBookingData(prev => ({ ...prev, passengerDetails: newPassengerDetails }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seat Class</label>
                <select
                  name="seatClass"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newSeats = [...bookingData.seats];
                    newSeats[0].class = e.target.value;
                    setBookingData(prev => ({ ...prev, seats: newSeats }));
                  }}
                >
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seat Number</label>
                <input
                  type="text"
                  name="seatNumber"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newSeats = [...bookingData.seats];
                    newSeats[0].seatNumber = e.target.value;
                    setBookingData(prev => ({ ...prev, seats: newSeats }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seat Price</label>
                <input
                  type="number"
                  name="seatPrice"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newSeats = [...bookingData.seats];
                    newSeats[0].price = parseFloat(e.target.value);
                    setBookingData(prev => ({ ...prev, seats: newSeats }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  type="number"
                  name="totalAmount"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleChange}
                >
                  <option value="online">Online</option>
                  <option value="manual">Manual</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method Detail</label>
                <select
                  name="paymentMethodDetail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    setBookingData(prev => ({
                      ...prev,
                      paymentDetails: { ...prev.paymentDetails, method: e.target.value as 'card' | 'wallet' | 'netbanking' | 'cash' | 'deferred' }
                    }));
                  }}
                >
                  <option value="card">Card</option>
                  <option value="wallet">Wallet</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="cash">Cash</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                <input
                  type="date"
                  name="travelDate"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingModal;
