import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Booking, Train as TrainType } from '../../types';

interface BookingSuccessProps {
  booking: Booking;
  train: TrainType;
  onContinue: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ onContinue }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Confirmed!</h1>
        <p className="text-gray-600 mb-8">Your train journey has been successfully booked.</p>

        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
