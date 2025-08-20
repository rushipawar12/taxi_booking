import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { sendBookingStatusUpdate } from '../services/emailService';
import './AdminDashboard.css';

function AdminDashboard() {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  // PDF Download function
  const downloadBookingsPDF = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Taxi Bookings Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #667eea; margin: 0; }
          .header p { margin: 5px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #667eea; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .status { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
          .status.confirmed { background: #d4edda; color: #155724; }
          .status.in-progress { background: #fff3cd; color: #856404; }
          .status.completed { background: #d1ecf1; color: #0c5460; }
          .status.cancelled { background: #f8d7da; color: #721c24; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚖 Taxi Booking System</h1>
          <p>Booking Details Report</p>
          <p>Generated on: ${currentDate}</p>
          <p>Total Bookings: ${bookings.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User Email</th>
              <th>Pickup Location</th>
              <th>Drop-off Location</th>
              <th>Pickup Date & Time</th>
              <th>Return Date & Time</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(booking => `
              <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.userEmail}</td>
                <td>${booking.pickupLocation}</td>
                <td>${booking.dropoffLocation}</td>
                <td>${booking.pickupDate}<br/><small>${booking.pickupTime}</small></td>
                <td>${booking.returnDate ? `${booking.returnDate}<br/><small>${booking.returnTime}</small>` : 'One Way'}</td>
                <td>₹${booking.totalPrice}</td>
                <td><span class="status ${booking.status}">${booking.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated automatically by the Taxi Booking System</p>
          <p>For any queries, contact the administrator</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };



  // Enhanced CSV Download function with proper structure
  const downloadBookingsCSV = () => {
    try {
      const currentDate = new Date().toLocaleDateString('en-IN');
      const currentTime = new Date().toLocaleTimeString('en-IN');

      // Create structured CSV content with proper formatting
      const csvLines = [];

      // Header section with company info
      csvLines.push('🚖 TAXI BOOKING SYSTEM - BOOKING REPORT');
      csvLines.push('='.repeat(60));
      csvLines.push(`Report Generated: ${currentDate} at ${currentTime}`);
      csvLines.push(`Total Bookings: ${bookings.length}`);
      csvLines.push(`Admin: rushikeshrpawar72@gmail.com`);
      csvLines.push(''); // Empty line

      // Summary statistics
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      const inProgressBookings = bookings.filter(b => b.status === 'in-progress').length;

      csvLines.push('BOOKING SUMMARY:');
      csvLines.push(`Confirmed: ${confirmedBookings}`);
      csvLines.push(`Completed: ${completedBookings}`);
      csvLines.push(`In Progress: ${inProgressBookings}`);
      csvLines.push(`Cancelled: ${cancelledBookings}`);
      csvLines.push(''); // Empty line

      // Total revenue calculation
      const totalRevenue = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      csvLines.push('FINANCIAL SUMMARY:');
      csvLines.push(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
      csvLines.push(`Average Booking Value: ₹${bookings.length > 0 ? Math.round(totalRevenue / bookings.length).toLocaleString('en-IN') : 0}`);
      csvLines.push(''); // Empty line
      csvLines.push('='.repeat(60));
      csvLines.push('DETAILED BOOKING DATA:');
      csvLines.push(''); // Empty line

      // Column headers
      const headers = [
        'Sr.No',
        'Booking ID',
        'Customer Email',
        'Pickup Location',
        'Drop-off Location',
        'Pickup Date',
        'Pickup Time',
        'Return Date',
        'Return Time',
        'Trip Type',
        'Price (₹)',
        'Status',
        'Booking Created'
      ];

      // Add headers to CSV
      csvLines.push(headers.map(h => `"${h}"`).join(','));

      // Add booking data with proper formatting
      bookings.forEach((booking, index) => {
        const row = [
          index + 1, // Serial number
          booking.bookingId || 'N/A',
          booking.userEmail || 'N/A',
          booking.pickupLocation || 'N/A',
          booking.dropoffLocation || 'N/A',
          booking.pickupDate || 'N/A',
          booking.pickupTime || 'N/A',
          booking.returnDate || 'One Way Trip',
          booking.returnTime || 'N/A',
          booking.returnDate ? 'Round Trip' : 'One Way',
          booking.totalPrice ? `₹${booking.totalPrice}` : '₹0',
          booking.status ? booking.status.toUpperCase() : 'UNKNOWN',
          booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : 'N/A'
        ];

        // Escape quotes and add to CSV
        csvLines.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
      });

      // Add footer
      csvLines.push(''); // Empty line
      csvLines.push('='.repeat(60));
      csvLines.push('Report End');
      csvLines.push(`Generated by Taxi Booking System on ${currentDate}`);

      // Join all lines
      const csvContent = csvLines.join('\n');

      // Add BOM for proper Excel encoding
      const BOM = '\uFEFF';
      const finalContent = BOM + csvContent;

      // Create CSV blob and open in browser
      const blob = new Blob([finalContent], {
        type: 'text/csv;charset=utf-8;'
      });

      const url = URL.createObjectURL(blob);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Taxi_Bookings_Report_${timestamp}.csv`;

      // Open CSV in new browser tab
      const newWindow = window.open(url, '_blank');

      // If popup blocked, fallback to download
      if (!newWindow) {
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`CSV file downloaded! (${bookings.length} bookings)`);
      } else {
        toast.success(`CSV report opened in browser! (${bookings.length} bookings)`);
      }

      // Cleanup after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error downloading CSV file:', error);
      toast.error('Failed to download CSV file. Please try again.');
    }
  };


  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    todayBookings: 0
  });

  useEffect(() => {
    // Check if user is admin
    if (userRole !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [userRole, navigate]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch bookings from localStorage
      const bookingsData = JSON.parse(localStorage.getItem('bookings') || '[]');
      setBookings(bookingsData);

      // Fetch users from localStorage
      const usersData = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(usersData);

      // Fetch email logs from localStorage
      const emailLogsData = JSON.parse(localStorage.getItem('emailLogs') || '[]');
      setEmailLogs(emailLogsData);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookingsData.filter(booking => 
        booking.createdAt?.split('T')[0] === today
      ).length;
      
      const totalRevenue = bookingsData.reduce((sum, booking) => 
        sum + (booking.totalPrice || 0), 0
      );

      setStats({
        totalBookings: bookingsData.length,
        totalUsers: usersData.length,
        totalRevenue,
        todayBookings
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId, newStatus) {
    try {
      // Find the booking to update
      const bookingsData = JSON.parse(localStorage.getItem('bookings') || '[]');
      const bookingToUpdate = bookingsData.find(booking => booking.id === bookingId);

      if (!bookingToUpdate) {
        toast.error('Booking not found');
        return;
      }

      // Update in localStorage
      const updatedBookings = bookingsData.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
          : booking
      );
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));

      // Update local state
      setBookings(updatedBookings);

      // Send status update email to customer
      try {
        const emailResult = await sendBookingStatusUpdate(bookingToUpdate, newStatus);
        if (emailResult.success) {
          toast.success(`Booking status updated to ${newStatus}. Email sent to customer.`);
        } else {
          toast.success(`Booking status updated to ${newStatus}. Email failed: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        toast.success(`Booking status updated to ${newStatus}. Email sending failed.`);
      }

    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  }

  // View email content function
  function viewEmailContent(email) {
    const emailWindow = window.open('', '_blank', 'width=800,height=600');
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Content - ${email.subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
          }
          .email-container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .email-header {
            border-bottom: 2px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .email-meta {
            background: #f8f9ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .email-content {
            white-space: pre-line;
            line-height: 1.6;
            font-size: 14px;
          }
          .print-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>📧 Email Content</h1>
          </div>

          <div class="email-meta">
            <p><strong>To:</strong> ${email.to}</p>
            <p><strong>Subject:</strong> ${email.subject}</p>
            <p><strong>Type:</strong> ${email.type === 'booking_confirmation' ? 'Booking Confirmation' : 'Status Update'}</p>
            <p><strong>Booking ID:</strong> ${email.bookingId}</p>
            <p><strong>Sent At:</strong> ${new Date(email.sentAt).toLocaleString('en-IN')}</p>
          </div>

          <button class="print-btn" onclick="window.print()">🖨️ Print Email</button>

          <div class="email-content">
${email.content}
          </div>
        </div>
      </body>
      </html>
    `;

    emailWindow.document.write(emailHtml);
    emailWindow.document.close();
  }



  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mb-6"></div>
        <p className="text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="font-medium">Welcome, Admin ({currentUser?.email})</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 border-2 border-white/30 rounded-lg hover:bg-white/30 transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-gray-600 text-sm font-medium mb-4">Total Bookings</h3>
            <p className="text-3xl font-bold text-primary-500">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-gray-600 text-sm font-medium mb-4">Total Users</h3>
            <p className="text-3xl font-bold text-primary-500">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-gray-600 text-sm font-medium mb-4">Total Revenue</h3>
            <p className="text-3xl font-bold text-primary-500">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-gray-600 text-sm font-medium mb-4">Today's Bookings</h3>
            <p className="text-3xl font-bold text-primary-500">{stats.todayBookings}</p>
          </div>
        </div>

        <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
          <div className="flex">
            <button
              className={`flex-1 py-4 px-6 font-medium transition-all duration-300 border-b-3 ${
                activeTab === 'bookings'
                  ? 'text-primary-500 border-primary-500 bg-blue-50'
                  : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings ({bookings.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 font-medium transition-all duration-300 border-b-3 ${
                activeTab === 'users'
                  ? 'text-primary-500 border-primary-500 bg-blue-50'
                  : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 font-medium transition-all duration-300 border-b-3 ${
                activeTab === 'emails'
                  ? 'text-primary-500 border-primary-500 bg-blue-50'
                  : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('emails')}
            >
              📧 Email Logs ({emailLogs.length})
            </button>
          </div>
        </div>

      <div className="admin-content">
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <div className="section-header">
              <h2>All Taxi Bookings</h2>
              {bookings.length > 0 && (
                <div className="download-buttons">
                  <button
                    onClick={downloadBookingsPDF}
                    className="download-btn pdf-btn"
                    title="Download PDF Report"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={downloadBookingsCSV}
                    className="download-btn csv-btn"
                    title="Download CSV File (Excel Compatible)"
                  >
                    📊 Download CSV
                  </button>
                </div>
              )}
            </div>
            {bookings.length === 0 ? (
              <p className="no-data">No bookings found</p>
            ) : (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>User Email</th>
                      <th>Pickup</th>
                      <th>Drop-off</th>
                      <th>Pickup Date & Time</th>
                      <th>Return Date & Time</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{booking.bookingId}</td>
                        <td>{booking.userEmail}</td>
                        <td>{booking.pickupLocation}</td>
                        <td>{booking.dropoffLocation}</td>
                        <td>
                          {booking.pickupDate}<br/>
                          <small>{booking.pickupTime}</small>
                        </td>
                        <td>
                          {booking.returnDate ? (
                            <>
                              {booking.returnDate}<br/>
                              <small>{booking.returnTime}</small>
                            </>
                          ) : (
                            <span className="text-gray-400">One Way</span>
                          )}
                        </td>
                        <td>₹{booking.totalPrice}</td>
                        <td>
                          <span className={`status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Registered Users</h2>
            {users.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <span className={`role ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {bookings.filter(booking => booking.userEmail === user.email).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="emails-section">
            <div className="section-header">
              <h2>📧 Email Logs</h2>
              <p className="text-gray-600">All emails sent to customers</p>
            </div>

            {loading ? (
              <div className="loading">Loading email logs...</div>
            ) : emailLogs.length === 0 ? (
              <div className="no-data">
                <p>No emails sent yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Email Type</th>
                      <th>Recipient</th>
                      <th>Subject</th>
                      <th>Booking ID</th>
                      <th>Status</th>
                      <th>Sent At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.map((email, index) => (
                      <tr key={email.id}>
                        <td>{index + 1}</td>
                        <td>
                          <span className={`email-type ${email.type}`}>
                            {email.type === 'booking_confirmation' ? '✅ Booking Confirmation' : '📊 Status Update'}
                          </span>
                        </td>
                        <td>{email.to}</td>
                        <td>{email.subject}</td>
                        <td>{email.bookingId}</td>
                        <td>
                          <span className={`email-status ${email.status || 'sent'}`}>
                            {email.status === 'failed' ? '❌ Failed' : '✅ Sent'}
                          </span>
                        </td>
                        <td>{new Date(email.sentAt).toLocaleString('en-IN')}</td>
                        <td>
                          <button
                            className="view-email-btn"
                            onClick={() => viewEmailContent(email)}
                            title="View Email Content"
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
