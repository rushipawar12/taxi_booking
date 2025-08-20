import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// import { collection, addDoc } from 'firebase/firestore';
// import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { sendBookingConfirmation } from '../services/emailService';
import './UserDashboard.css';

function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReturnTimePicker, setShowReturnTimePicker] = useState(false);

  // Time slots similar to your image
  const timeSlots = [
    '12:00 AM', '12:15 AM', '12:30 AM', '12:45 AM',
    '01:00 AM', '01:15 AM', '01:30 AM', '01:45 AM',
    '02:00 AM', '02:15 AM', '02:30 AM', '02:45 AM',
    '03:00 AM', '03:15 AM', '03:30 AM', '03:45 AM',
    '04:00 AM', '04:15 AM', '04:30 AM', '04:45 AM',
    '05:00 AM', '05:15 AM', '05:30 AM', '05:45 AM',
    '06:00 AM', '06:15 AM', '06:30 AM', '06:45 AM',
    '07:00 AM', '07:15 AM', '07:30 AM', '07:45 AM',
    '08:00 AM', '08:15 AM', '08:30 AM', '08:45 AM',
    '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
    '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
    '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
    '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM',
    '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM',
    '06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM',
    '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM',
    '08:00 PM', '08:15 PM', '08:30 PM', '08:45 PM',
    '09:00 PM', '09:15 PM', '09:30 PM', '09:45 PM',
    '10:00 PM', '10:15 PM', '10:30 PM', '10:45 PM',
    '11:00 PM', '11:15 PM', '11:30 PM', '11:45 PM'
  ];



  // Fixed price for all bookings
  const FIXED_PRICE = 500;

  function handleInputChange(e) {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  }

  function handleTimeSelect(time) {
    setBookingData({
      ...bookingData,
      pickupTime: time
    });
    setShowTimePicker(false); // Close time picker after selection
  }

  function handleReturnTimeSelect(time) {
    setBookingData({
      ...bookingData,
      returnTime: time
    });
    setShowReturnTimePicker(false); // Close return time picker after selection
  }



  async function sendEmailNotification(bookingDetails) {
    try {
      const result = await sendBookingConfirmation({
        ...bookingDetails,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email
      });

      if (result.success) {
        console.log('Email sent successfully');
      } else {
        console.error('Failed to send email:', result.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();
    
    if (!bookingData.pickupLocation || !bookingData.dropoffLocation || 
        !bookingData.pickupDate || !bookingData.pickupTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const totalPrice = FIXED_PRICE;
      
      const booking = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        ...bookingData,
        totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        bookingId: `TB${Date.now()}`
      };

      // Save to localStorage
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const bookingWithId = { ...booking, id: Date.now().toString() };
      bookings.push(bookingWithId);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      // Send email notification
      await sendEmailNotification(bookingWithId);
      
      toast.success('Taxi booked successfully! Confirmation email sent.');
      
      // Reset form
      setBookingData({
        pickupLocation: '',
        dropoffLocation: '',
        pickupDate: '',
        pickupTime: '',
        returnDate: '',
        returnTime: ''
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book taxi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Taxi Booking Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">Welcome, {currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-center mb-8 text-gray-800 text-2xl font-semibold">Book Your Taxi</h2>
          <form onSubmit={handleBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-600 font-medium text-sm">Pickup Location *</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-600 font-medium text-sm">Drop-off Location *</label>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={bookingData.dropoffLocation}
                  onChange={handleInputChange}
                  placeholder="Enter drop-off location"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-600 font-medium text-sm">Pickup Date *</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={bookingData.pickupDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-600 font-medium text-sm">Pickup Time *</label>
                <div
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white cursor-pointer hover:border-primary-500"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                >
                  <span className={bookingData.pickupTime ? 'text-gray-900' : 'text-gray-500'}>
                    {bookingData.pickupTime ? bookingData.pickupTime : 'hh:mm AM/PM'}
                  </span>
                  <span className="float-right text-gray-400">🕐</span>
                </div>
              </div>
            </div>

            {showTimePicker && (
              <div className="mt-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-4 border-2 border-gray-200 rounded-lg bg-gray-50 max-w-4xl">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all duration-300 text-xs font-medium text-center ${
                        bookingData.pickupTime === time
                          ? 'bg-red-100 text-red-600 border-red-300'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500 hover:bg-blue-50'
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Return Date and Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block mb-2 text-gray-600 font-medium text-sm">Return Date (Optional)</label>
                <input
                  type="date"
                  name="returnDate"
                  value={bookingData.returnDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-600 font-medium text-sm">Return Time (Optional)</label>
                <div
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white cursor-pointer hover:border-primary-500"
                  onClick={() => setShowReturnTimePicker(!showReturnTimePicker)}
                >
                  <span className={bookingData.returnTime ? 'text-gray-900' : 'text-gray-500'}>
                    {bookingData.returnTime ? bookingData.returnTime : 'hh:mm AM/PM'}
                  </span>
                  <span className="float-right text-gray-400">🕐</span>
                </div>
              </div>
            </div>

            {/* Return Time Picker */}
            {showReturnTimePicker && (
              <div className="mt-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-4 border-2 border-gray-200 rounded-lg bg-gray-50 max-w-4xl">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all duration-300 text-xs font-medium text-center ${
                        bookingData.returnTime === time
                          ? 'bg-red-100 text-red-600 border-red-300'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500 hover:bg-blue-50'
                      }`}
                      onClick={() => handleReturnTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white border-none rounded-lg text-lg font-semibold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {loading ? 'Booking...' : 'Book Car'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
