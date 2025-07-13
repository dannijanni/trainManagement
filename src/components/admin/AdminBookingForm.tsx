import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Train, Booking, User as UserType } from '../../types';

interface AdminBookingFormProps {
  onBack: () => void;
  onBookingComplete: (booking: Booking) => void;
}

const AdminBookingForm: React.FC<AdminBookingFormProps> = ({ 
  onBack, 
  onBookingComplete 
}) => {
  const { user } = useAuth();
  const [trains, setTrains] = useState<Train[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [passengers, setPassengers] = useState([{
    name: '',
    age: 30,
    gender: 'male' as 'male' | 'female' | 'other',
    email: '',
    phone: ''
  }]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'manual' | 'deferred'>('online');
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'card' as 'card' | 'cash' | 'deferred',
    counterLocation: '',
    deferralReason: '',
    paymentDeadline: '',
    notes: ''
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const trainsData = LocalStorageManager.getTrains();
    const usersData = LocalStorageManager.getUsers();
    setTrains(trainsData.filter(t => t.status === 'active'));
    setUsers(usersData.filter(u => u.role === 'customer'));
  };

  const generateSeats = () => {
    if (!selectedTrain || !selectedClass) return [];
    
    const classData = selectedTrain.classes[selectedClass];
    const seats = [];
    const seatCount = classData.totalSeats;
    const seatsPerRow = 4;
    const rows = Math.ceil(seatCount / seatsPerRow);
    
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatNumber = `${row}${String.fromCharCode(64 + seat)}`;
        if (seats.length < seatCount) {
          seats.push({
            number: seatNumber,
            isAvailable: Math.random() > 0.3,
            isSelected: false
          });
        }
      }
    }
    
    return seats;
  };

  const [availableSeats, setAvailableSeats] = useState<any[]>([]);

  useEffect(() => {
    if (selectedTrain && selectedClass) {
      setAvailableSeats(generateSeats());
    }
  }, [selectedTrain, selectedClass]);

  const handleSeatSelect = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else if (selectedSeats.length < passengers.length) {
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const handlePassengerChange = (index: number, field: string, value: string | number) => {
    setPassengers(prev => 
      prev.map((passenger, i) => 
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const addPassenger = () => {
    setPassengers(prev => [...prev, {
      name: '',
      age: 30,
      gender: 'male' as 'male' | 'female' | 'other',
      email: '',
      phone: ''
    }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter((_, i) => i !== index));
      setSelectedSeats(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleBooking = async () => {
    setProcessing(true);
    setError('');

    try {
      if (!selectedTrain || !selectedClass || selectedSeats.length !== passengers.length) {
        throw new Error('Please complete all booking details');
      }

      const classData = selectedTrain.classes[selectedClass];
      const totalAmount = classData.price * passengers.length;

      // Create booking
      const booking: Booking = {
        id: Date.now().toString(),
        trainId: selectedTrain.id,
        userId: selectedUserId || user?.id || '',
        passengerDetails: passengers,
        seats: selectedSeats.map(seatNumber => ({
          class: selectedClass,
          seatNumber,
          price: classData.price
        })),
        totalAmount,
        status: 'confirmed',
        paymentStatus: paymentMethod === 'deferred' ? 'pending' : 'completed',
        paymentMethod,
        paymentDetails: paymentMethod !== 'online' ? {
          method: paymentDetails.method,
          cashierName: `${user?.firstName} ${user?.lastName}`,
          counterLocation: paymentDetails.counterLocation,
          deferralReason: paymentDetails.deferralReason,
          paymentDeadline: paymentDetails.paymentDeadline
        } : undefined,
        paymentId: paymentMethod === 'online' ? 'pay_' + Date.now() : undefined,
        bookingDate: new Date().toISOString(),
        travelDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        qrCode: 'QR_' + Date.now(),
        createdBy: user?.id,
        notes: paymentDetails.notes,
        isAdminBooking: true,
        specialBookingCode: paymentMethod === 'deferred' ? 'DEF_' + Date.now() : undefined
      };

      // Save booking
      const bookings = LocalStorageManager.getBookings();
      bookings.push(booking);
      LocalStorageManager.saveBookings(bookings);

      // Update train availability
      const updatedTrains = trains.map(train =>
        train.id === selectedTrain.id
          ? {
              ...train,
              classes: {
                ...train.classes,
                [selectedClass]: {
                  ...train.classes[selectedClass],
                  availableSeats: train.classes[selectedClass].availableSeats - passengers.length
                }
              }
            }
          : train
      );
      LocalStorageManager.saveTrains(updatedTrains);

      // Log activity
      LocalStorageManager.logUserActivity(
        user?.id || '',
        'admin_booking_created',
        `Created booking ${booking.id} for ${passengers.length} passengers`
      );

      onBookingComplete(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Train & Customer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer (Optional)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Walk-in Customer</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Train
            </label>
            <select
              required
              value={selectedTrain?.id || ''}
              onChange={(e) => {
                const train = trains.find(t => t.id === e.target.value);
                setSelectedTrain(train || null);
                setSelectedClass('');
                setSelectedSeats([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Train</option>
              {trains.map(train => (
                <option key={train.id} value={train.id}>
                  {train.name} ({train.number}) - {train.route.from} → {train.route.to}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTrain && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Available Classes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(selectedTrain.classes).map(([className, classData]) => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedClass === className
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{className}</p>
                    <p className="text-sm text-gray-600">{classData.availableSeats} seats available</p>
                    <p className="text-lg font-bold text-blue-600">${classData.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Passenger Details</h3>
          <button
            onClick={addPassenger}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Passenger
          </button>
        </div>

        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Passenger {index + 1}</h4>
                {index > 0 && (
                  <button
                    onClick={() => removePassenger(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={passenger.phone}
                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!selectedTrain || !selectedClass || passengers.some(p => !p.name || !p.email || !p.phone)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Select Seats
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Seats ({selectedSeats.length}/{passengers.length})
        </h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded border-2 border-gray-300"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded border-2 border-gray-300"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded border-2 border-gray-300"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {availableSeats.map((seat, index) => (
              <button
                key={seat.number}
                onClick={() => seat.isAvailable && handleSeatSelect(seat.number)}
                disabled={!seat.isAvailable}
                className={`
                  w-12 h-12 rounded text-xs font-medium border-2 transition-colors
                  ${selectedSeats.includes(seat.number) 
                    ? 'bg-blue-500 text-white border-blue-600' 
                    : seat.isAvailable 
                      ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {seat.number}
              </button>
            ))}
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Selected Seats:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map(seat => (
                <span key={seat} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {seat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={selectedSeats.length !== passengers.length}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Payment Options
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const totalAmount = selectedTrain && selectedClass 
      ? selectedTrain.classes[selectedClass].price * passengers.length 
      : 0;

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Train:</span>
              <span>{selectedTrain?.name} ({selectedTrain?.number})</span>
            </div>
            <div className="flex justify-between">
              <span>Route:</span>
              <span>{selectedTrain?.route.from} → {selectedTrain?.route.to}</span>
            </div>
            <div className="flex justify-between">
              <span>Class:</span>
              <span>{selectedClass}</span>
            </div>
            <div className="flex justify-between">
              <span>Passengers:</span>
              <span>{passengers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Seats:</span>
              <span>{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${totalAmount}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('online')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'online' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Online Payment</p>
                <p className="text-sm text-gray-600">Card/Wallet/Banking</p>
              </button>

              <button
                onClick={() => setPaymentMethod('manual')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'manual' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="font-medium">Manual Payment</p>
                <p className="text-sm text-gray-600">Cash/Counter</p>
              </button>

              <button
                onClick={() => setPaymentMethod('deferred')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'deferred' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="font-medium">Deferred Payment</p>
                <p className="text-sm text-gray-600">Pay Later</p>
              </button>
            </div>

            {paymentMethod === 'manual' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentDetails.method}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, method: e.target.value as any }))}
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
                      value={paymentDetails.counterLocation}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, counterLocation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Station Counter 1"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'deferred' && (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={paymentDetails.paymentDeadline}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentDeadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deferral Reason
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentDetails.deferralReason}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, deferralReason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Reason for payment deferral"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={paymentDetails.notes}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Additional notes for this booking..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleBooking}
            disabled={processing || (paymentMethod === 'manual' && !paymentDetails.counterLocation) || (paymentMethod === 'deferred' && (!paymentDetails.paymentDeadline || !paymentDetails.deferralReason))}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Create Booking
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Admin Booking</h1>
          <p className="text-gray-600 mt-2">Create bookings with special privileges and payment options</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingForm;