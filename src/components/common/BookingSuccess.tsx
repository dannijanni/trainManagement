import React, { useRef } from 'react';
import { CheckCircle, Download, Share2, Calendar, Train, MapPin, QrCode, Copy, Mail, MessageSquare } from 'lucide-react';
import { Booking, Train as TrainType } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';

interface BookingSuccessProps {
  booking: Booking;
  train: TrainType;
  onContinue: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ booking, train, onContinue }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      return await QRCodeLib.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Generate QR code
      const qrCodeData = JSON.stringify({
        bookingId: booking.id,
        trainNumber: train.number,
        travelDate: booking.travelDate,
        passengers: booking.passengerDetails.length,
        totalAmount: booking.totalAmount
      });
      
      const qrCodeDataURL = await generateQRCode(qrCodeData);
      
      // Create a printable ticket element
      const ticketElement = document.createElement('div');
      ticketElement.innerHTML = `
        <div style="width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white; padding: 40px; box-sizing: border-box;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; font-weight: bold;">TrainWay Express</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 16px;">Your Journey Begins Here</p>
          </div>
          
          <!-- Ticket Type -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; margin: 0; font-size: 24px; font-weight: bold;">E-TICKET</h2>
          </div>
          
          <!-- Main Content -->
          <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <!-- Left Column -->
            <div style="flex: 2;">
              <!-- Booking Details -->
              <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #2563eb;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Booking Information</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                  <div><strong>Booking ID:</strong><br><span style="color: #2563eb; font-weight: bold;">${booking.id}</span></div>
                  <div><strong>Status:</strong><br><span style="color: #059669; font-weight: bold;">${booking.status.toUpperCase()}</span></div>
                  <div><strong>Booking Date:</strong><br>${new Date(booking.bookingDate).toLocaleDateString()}</div>
                  <div><strong>Travel Date:</strong><br><span style="color: #dc2626; font-weight: bold;">${new Date(booking.travelDate).toLocaleDateString()}</span></div>
                </div>
              </div>
              
              <!-- Journey Details -->
              <div style="background: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #0ea5e9;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Journey Details</h3>
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
                    <div style="text-align: center;">
                      <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${train.route.from}</div>
                      <div style="font-size: 14px; color: #6b7280;">Departure</div>
                      <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${train.schedule.departure}</div>
                    </div>
                    <div style="flex: 1; height: 2px; background: linear-gradient(to right, #2563eb, #0ea5e9); position: relative;">
                      <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; font-size: 12px; color: #6b7280;">${train.schedule.duration}</div>
                    </div>
                    <div style="text-align: center;">
                      <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${train.route.to}</div>
                      <div style="font-size: 14px; color: #6b7280;">Arrival</div>
                      <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${train.schedule.arrival}</div>
                    </div>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                  <div><strong>Train:</strong><br>${train.name} (${train.number})</div>
                  <div><strong>Class:</strong><br>${booking.seats[0]?.class}</div>
                  <div><strong>Seats:</strong><br>${booking.seats.map(seat => seat.seatNumber).join(', ')}</div>
                  <div><strong>Passengers:</strong><br>${booking.passengerDetails.length}</div>
                </div>
              </div>
              
              <!-- Passenger Details -->
              <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; border-left: 5px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Passenger Details</h3>
                ${booking.passengerDetails.map((passenger, index) => `
                  <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; font-size: 14px;">
                      <div><strong>${passenger.name}</strong><br><span style="color: #6b7280;">${passenger.email}</span></div>
                      <div>Age: ${passenger.age}<br>Gender: ${passenger.gender}</div>
                      <div>Phone:<br>${passenger.phone}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- Right Column - QR Code and Payment -->
            <div style="flex: 1;">
              <!-- QR Code -->
              <div style="text-align: center; background: white; padding: 25px; border-radius: 12px; border: 2px solid #e5e7eb; margin-bottom: 25px;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">Scan for Verification</h3>
                <img src="${qrCodeDataURL}" style="width: 150px; height: 150px; margin: 0 auto; display: block;" alt="QR Code">
                <p style="font-size: 12px; color: #6b7280; margin: 15px 0 0 0;">Show this QR code to the conductor</p>
              </div>
              
              <!-- Payment Summary -->
              <div style="background: #fef3c7; padding: 25px; border-radius: 12px; border-left: 5px solid #f59e0b;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">Payment Summary</h3>
                <div style="font-size: 14px; margin-bottom: 15px;">
                  ${booking.seats.map(seat => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span>${seat.class} (${seat.seatNumber})</span>
                      <span>$${seat.price}</span>
                    </div>
                  `).join('')}
                </div>
                <div style="border-top: 2px solid #f59e0b; padding-top: 15px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between;">
                  <span>Total Paid:</span>
                  <span style="color: #059669;">$${booking.totalAmount}</span>
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                  Payment ID: ${booking.paymentId || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Important Information -->
          <div style="background: #fef2f2; padding: 25px; border-radius: 12px; border-left: 5px solid #ef4444; margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Important Information</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151; line-height: 1.6;">
              <li>Please arrive at the station 30 minutes before departure</li>
              <li>Carry a valid ID proof along with this e-ticket</li>
              <li>Show the QR code to the conductor for verification</li>
              <li>Cancellation is allowed up to 2 hours before departure</li>
              <li>This ticket is non-transferable and valid only for the specified date</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; border-top: 2px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">Thank you for choosing TrainWay Express</p>
            <p style="margin: 0;">For support, contact us at support@trainway.com | +1-800-TRAINWAY</p>
            <p style="margin: 10px 0 0 0;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;
      
      // Temporarily add to DOM for rendering
      document.body.appendChild(ticketElement);
      
      // Convert to canvas
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove from DOM
      document.body.removeChild(ticketElement);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TrainWay-Ticket-${booking.id}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF ticket. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async (method: string) => {
    const shareData = {
      title: 'TrainWay Train Ticket',
      text: `My train ticket for ${train.name} from ${train.route.from} to ${train.route.to} on ${new Date(booking.travelDate).toLocaleDateString()}. Booking ID: ${booking.id}`,
      url: window.location.href
    };

    switch (method) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.log('Error sharing:', err);
          }
        }
        break;
        
      case 'copy':
        try {
          await navigator.clipboard.writeText(
            `🚂 TrainWay Ticket\n\n` +
            `Train: ${train.name} (${train.number})\n` +
            `Route: ${train.route.from} → ${train.route.to}\n` +
            `Date: ${new Date(booking.travelDate).toLocaleDateString()}\n` +
            `Time: ${train.schedule.departure} - ${train.schedule.arrival}\n` +
            `Seats: ${booking.seats.map(s => s.seatNumber).join(', ')}\n` +
            `Booking ID: ${booking.id}\n` +
            `Total: $${booking.totalAmount}\n\n` +
            `Generated by TrainWay Express`
          );
          alert('Ticket details copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
        
      case 'email':
        const emailSubject = encodeURIComponent(`TrainWay Ticket - ${booking.id}`);
        const emailBody = encodeURIComponent(
          `Dear Friend,\n\n` +
          `I wanted to share my train ticket details with you:\n\n` +
          `Train: ${train.name} (${train.number})\n` +
          `Route: ${train.route.from} → ${train.route.to}\n` +
          `Date: ${new Date(booking.travelDate).toLocaleDateString()}\n` +
          `Time: ${train.schedule.departure} - ${train.schedule.arrival}\n` +
          `Seats: ${booking.seats.map(s => s.seatNumber).join(', ')}\n` +
          `Booking ID: ${booking.id}\n\n` +
          `Best regards,\n` +
          `${booking.passengerDetails[0]?.name}`
        );
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
        break;
        
      case 'sms':
        const smsBody = encodeURIComponent(
          `🚂 My TrainWay ticket: ${train.name} from ${train.route.from} to ${train.route.to} on ${new Date(booking.travelDate).toLocaleDateString()}. Booking: ${booking.id}`
        );
        window.open(`sms:?body=${smsBody}`);
        break;
        
      case 'whatsapp':
        const whatsappText = encodeURIComponent(
          `🚂 *TrainWay Ticket*\n\n` +
          `*Train:* ${train.name} (${train.number})\n` +
          `*Route:* ${train.route.from} → ${train.route.to}\n` +
          `*Date:* ${new Date(booking.travelDate).toLocaleDateString()}\n` +
          `*Time:* ${train.schedule.departure} - ${train.schedule.arrival}\n` +
          `*Seats:* ${booking.seats.map(s => s.seatNumber).join(', ')}\n` +
          `*Booking ID:* ${booking.id}\n` +
          `*Total:* $${booking.totalAmount}`
        );
        window.open(`https://wa.me/?text=${whatsappText}`);
        break;
    }
    
    setShowShareMenu(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your train journey has been successfully booked</p>
        </div>

        <div ref={ticketRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* E-Ticket Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">E-Ticket</h2>
                <p className="text-blue-100 mt-1">Booking ID: {booking.id}</p>
              </div>
              <div className="text-right">
                <div className="bg-white p-2 rounded">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-100 mt-1">QR Code</p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Journey Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Train className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{train.name} ({train.number})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{train.route.from} → {train.route.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure:</span>
                    <span className="font-medium">{train.schedule.departure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arrival:</span>
                    <span className="font-medium">{train.schedule.arrival}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{train.schedule.duration}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Seat Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Class:</span>
                    <span className="font-medium">{booking.seats[0]?.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span className="font-medium">
                      {booking.seats.map(seat => seat.seatNumber).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-medium">{booking.passengerDetails.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-green-600 pt-2 border-t">
                    <span>Total Paid:</span>
                    <span>${booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Passenger Details</h3>
              <div className="space-y-3">
                {booking.passengerDetails.map((passenger, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{passenger.name}</p>
                      <p className="text-sm text-gray-600">
                        {passenger.age} years • {passenger.gender}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{passenger.email}</p>
                      <p className="text-sm text-gray-600">{passenger.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Please arrive at the station 30 minutes before departure</li>
                <li>• Carry a valid ID proof along with this e-ticket</li>
                <li>• Show the QR code to the conductor for verification</li>
                <li>• Cancellation is allowed up to 2 hours before departure</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadTicket}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF Ticket
                  </>
                )}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                >
                  <Share2 className="h-4 w-4" />
                  Share Ticket
                </button>
                
                {showShareMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-2">
                      {navigator.share && (
                        <button
                          onClick={() => handleShare('native')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share via System
                        </button>
                      )}
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Details
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Share via Email
                      </button>
                      <button
                        onClick={() => handleShare('sms')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Share via SMS
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Share via WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={onContinue}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@trainway.com" className="text-blue-600 hover:text-blue-700">
              support@trainway.com
            </a>
          </p>
        </div>
      </div>
      
      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default BookingSuccess;