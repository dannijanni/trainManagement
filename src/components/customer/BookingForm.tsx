import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MapPin,
  Train
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Train as TrainType, Booking } from '../../types';
import { createBooking } from '../../services/bookingAPI';
import { v4 as uuidv4 } from 'uuid';

interface BookingFormProps {
  train: TrainType;
  selectedClass: string;
  travelDate: string;
  onBack: () => void;
  onBookingComplete: (booking: Booking) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  train, 
  selectedClass, 
  travelDate,
  onBack, 
  onBookingComplete 
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [passengers, setPassengers] = useState([{
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    age: 30,
    gender: 'male' as 'male' | 'female' | 'other',
    email: user?.email || '',
    phone: user?.phone || ''
  }]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    billingAddress: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedTravelDate, setSelectedTravelDate] = useState(travelDate);

  const classData = train.classes[selectedClass];
  const totalAmount = classData.price * passengers.length;

  const generateSeats = () => {
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

  const [availableSeats] = useState(generateSeats());

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

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // Validate travel date
      if (!selectedTravelDate) {
        throw new Error('Please select a valid travel date');
      }

      // Prepare booking data
      const bookingData: Booking = {
        trainId: train.id,
        userId: user?.id || '',
        passengerDetails: passengers.map(p => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          email: p.email,
          phone: p.phone
        })),
        seats: selectedSeats.map(seatNumber => ({
          class: selectedClass,
          seatNumber,
          price: classData.price
        })),
        totalAmount,
        status: "confirmed",
        paymentStatus: "completed",
        paymentMethod: "online",
        paymentDetails: {
          method: "card",
          transactionId: `TXN-${Date.now()}`,
          cashierName: "",
          counterLocation: "",
          deferralReason: "",
          paymentDeadline: ""
        },
        paymentId: uuidv4(),
        bookingDate: new Date().toISOString(),
        travelDate: selectedTravelDate,
        qrCode: `QR-${Date.now()}`,
        createdBy: user?.id || '',
        notes: "Online booking",
        specialBookingCode: "",
        isAdminBooking: false,
        passengers: undefined,
        bookingSeats: undefined,
        id: ''
      };

      // Create booking via API
      const createdBooking = await createBooking(bookingData);
      
      if (createdBooking) {
        onBookingComplete(createdBooking);
      } else {
        throw new Error('Booking creation failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Payment failed. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Train className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Trip Details</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-medium">{train.name} ({train.number})</p>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {train.route.from} → {train.route.to}
              </p>
              <p><span className="font-medium">Class:</span> {selectedClass}</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={selectedTravelDate}
                    onChange={(e) => setSelectedTravelDate(e.target.value)}
                    className="px-2 py-1 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <p><span className="font-medium">Price:</span> ${classData.price} per person</p>
            </div>
          </div>
        </div>
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
          Back to Search
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={passengers.some(p => !p.name || !p.email || !p.phone)}
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
            {availableSeats.map((seat) => (
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
          Proceed to Payment
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Train:</span>
            <span>{train.name} ({train.number})</span>
          </div>
          <div className="flex justify-between">
            <span>Route:</span>
            <span>{train.route.from} → {train.route.to}</span>
          </div>
          <div className="flex justify-between">
            <span>Class:</span>
            <span>{selectedClass}</span>
          </div>
          <div className="flex justify-between">
            <span>Travel Date:</span>
            <span>{new Date(travelDate).toLocaleDateString()}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              required
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                value={paymentData.expiryDate}
                onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                required
                placeholder="123"
                value={paymentData.cvv}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={paymentData.cardName}
              onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <textarea
              required
              placeholder="Enter your billing address"
              value={paymentData.billingAddress}
              onChange={(e) => setPaymentData(prev => ({ ...prev, billingAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
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
          onClick={handlePayment}
          disabled={processing || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardName || !paymentData.billingAddress}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay ${totalAmount}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Journey</h1>
          <p className="text-gray-600 mt-2">Complete your booking in a few simple steps</p>
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

export default BookingForm;
