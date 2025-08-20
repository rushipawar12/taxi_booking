import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG } from './emailConfig.js';

// EmailJS configuration
const EMAIL_CONFIG = {
  enabled: true,
  serviceId: EMAILJS_CONFIG.SERVICE_ID,
  templateId: EMAILJS_CONFIG.TEMPLATE_ID,
  userId: EMAILJS_CONFIG.USER_ID,
  adminEmail: EMAILJS_CONFIG.ADMIN_EMAIL,
  fromName: EMAILJS_CONFIG.COMPANY_NAME,
  supportPhone: EMAILJS_CONFIG.SUPPORT_PHONE
};

// Initialize EmailJS
export function initEmailJS() {
  try {
    emailjs.init(EMAIL_CONFIG.userId);
    console.log('✅ EmailJS initialized successfully');
  } catch (error) {
    console.error('❌ EmailJS initialization failed:', error);
  }
}

// Send booking confirmation email - Simple version
export async function sendBookingConfirmation(bookingDetails) {
  try {
    console.log('📧 PREPARING EMAIL...');
    console.log('Config:', EMAIL_CONFIG);
    console.log('Booking Details:', bookingDetails);

    if (!EMAIL_CONFIG.enabled) {
      console.log('Email service disabled');
      return { success: true, message: 'Email service disabled' };
    }

    // Template parameters matching your EmailJS template
    const templateParams = {
      user_name: bookingDetails.userName || bookingDetails.userEmail.split('@')[0],
      booking_id: bookingDetails.bookingId,
      user_email: bookingDetails.userEmail,
      pickup_location: bookingDetails.pickupLocation,
      dropoff_location: bookingDetails.dropoffLocation,
      pickup_date: bookingDetails.pickupDate,
      pickup_time: bookingDetails.pickupTime,
      total_price: bookingDetails.totalPrice,
      status: (bookingDetails.status || 'CONFIRMED').toUpperCase(),
      support_phone: EMAIL_CONFIG.supportPhone,
      admin_email: EMAIL_CONFIG.adminEmail
    };

    console.log('📧 SENDING EMAIL WITH PARAMS:', templateParams);

    try {
      // Send email using EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        templateParams
      );

      console.log('✅ EMAIL SENT SUCCESSFULLY!');
      console.log('Response:', response);

      // Store email log
      const emailLog = {
        id: Date.now(),
        to: bookingDetails.userEmail,
        subject: `Taxi Booking Confirmation - ${bookingDetails.bookingId}`,
        content: templateParams.message,
        sentAt: new Date().toISOString(),
        type: 'booking_confirmation',
        bookingId: bookingDetails.bookingId,
        status: 'sent'
      };

      const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
      emailLogs.push(emailLog);
      localStorage.setItem('emailLogs', JSON.stringify(emailLogs));

      return {
        success: true,
        message: 'Email sent successfully!',
        response
      };
    } catch (emailError) {
      console.error('❌ EMAIL SENDING FAILED:', emailError);
      console.error('Error details:', emailError);

      // Store failed email log
      const emailLog = {
        id: Date.now(),
        to: bookingDetails.userEmail,
        subject: `Taxi Booking Confirmation - ${bookingDetails.bookingId}`,
        content: templateParams.message,
        sentAt: new Date().toISOString(),
        type: 'booking_confirmation',
        bookingId: bookingDetails.bookingId,
        status: 'failed',
        error: emailError.message
      };

      const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
      emailLogs.push(emailLog);
      localStorage.setItem('emailLogs', JSON.stringify(emailLogs));

      return {
        success: false,
        error: `Email failed: ${emailError.message}`,
        details: emailError
      };
    }
  } catch (error) {
    console.error('❌ EMAIL SERVICE ERROR:', error);
    return { success: false, error: error.message };
  }
}

// Create email content for booking confirmation
function createBookingConfirmationEmail(bookingDetails) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const currentTime = new Date().toLocaleTimeString('en-IN');

  return `
🚖 TAXI BOOKING CONFIRMATION 🚖
═══════════════════════════════════════════════════════════

Dear ${bookingDetails.userName || bookingDetails.userEmail.split('@')[0]},

Thank you for booking with our Taxi Service! Your booking has been confirmed.

📋 BOOKING DETAILS:
═══════════════════════════════════════════════════════════
🆔 Booking ID: ${bookingDetails.bookingId}
📧 Customer Email: ${bookingDetails.userEmail}
📍 Pickup Location: ${bookingDetails.pickupLocation}
🎯 Drop-off Location: ${bookingDetails.dropoffLocation}
📅 Pickup Date: ${bookingDetails.pickupDate}
⏰ Pickup Time: ${bookingDetails.pickupTime}
${bookingDetails.returnDate ? `🔄 Return Date: ${bookingDetails.returnDate}` : '🔄 Trip Type: One Way'}
${bookingDetails.returnTime ? `⏰ Return Time: ${bookingDetails.returnTime}` : ''}
💰 Total Price: ₹${bookingDetails.totalPrice}
✅ Status: ${(bookingDetails.status || 'confirmed').toUpperCase()}
📝 Booked On: ${new Date(bookingDetails.createdAt).toLocaleDateString('en-IN')} at ${new Date(bookingDetails.createdAt).toLocaleTimeString('en-IN')}

📞 CONTACT INFORMATION:
═══════════════════════════════════════════════════════════
📱 Customer Support: +91-9876543210
📧 Email Support: support@taxibooking.com
🌐 Website: www.taxibooking.com

⚠️ IMPORTANT NOTES:
═══════════════════════════════════════════════════════════
• Please be ready 10 minutes before pickup time
• Driver will contact you 15 minutes before arrival
• Keep your booking ID handy for reference
• For any changes, contact us at least 2 hours before pickup

🙏 Thank you for choosing our service!
We look forward to serving you.

Best Regards,
Taxi Booking Team
═══════════════════════════════════════════════════════════
Email sent on: ${currentDate} at ${currentTime}
  `.trim();
}

// Send booking status update email using EmailJS
export async function sendBookingStatusUpdate(bookingDetails, newStatus) {
  try {
    if (!EMAIL_CONFIG.enabled) {
      console.log('Email service disabled');
      return { success: true, message: 'Email service disabled' };
    }

    // Prepare template parameters for status update
    const templateParams = {
      to_email: bookingDetails.userEmail,
      user_name: bookingDetails.userName || bookingDetails.userEmail.split('@')[0],
      booking_id: bookingDetails.bookingId,
      pickup_location: bookingDetails.pickupLocation,
      dropoff_location: bookingDetails.dropoffLocation,
      pickup_date: bookingDetails.pickupDate,
      pickup_time: bookingDetails.pickupTime,
      old_status: (bookingDetails.status || 'unknown').toUpperCase(),
      new_status: newStatus.toUpperCase(),
      admin_email: EMAIL_CONFIG.adminEmail,
      support_phone: EMAIL_CONFIG.supportPhone,
      updated_at: new Date().toLocaleString('en-IN')
    };

    try {
      // Send status update email using EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId, // You can create a separate template for status updates
        templateParams
      );

      console.log('✅ STATUS UPDATE EMAIL SENT SUCCESSFULLY!');
      console.log(`📧 From: ${EMAIL_CONFIG.adminEmail}`);
      console.log(`📧 To: ${bookingDetails.userEmail}`);
      console.log(`📊 Status: ${bookingDetails.status} → ${newStatus}`);
      console.log('EmailJS Response:', response);

      // Store email in localStorage for admin to see
      const emailLog = {
        id: Date.now(),
        to: bookingDetails.userEmail,
        subject: `🚖 Booking Status Update - ${bookingDetails.bookingId}`,
        content: `Status update sent via EmailJS for ${bookingDetails.bookingId}: ${bookingDetails.status} → ${newStatus}`,
        sentAt: new Date().toISOString(),
        type: 'status_update',
        bookingId: bookingDetails.bookingId,
        oldStatus: bookingDetails.status,
        newStatus: newStatus,
        status: 'sent',
        emailjsResponse: response.status
      };

      const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
      emailLogs.push(emailLog);
      localStorage.setItem('emailLogs', JSON.stringify(emailLogs));

      return {
        success: true,
        message: 'Status update email sent successfully!',
        response
      };
    } catch (emailError) {
      console.error('❌ Status update email sending failed:', emailError);

      // Store as failed email
      const emailLog = {
        id: Date.now(),
        to: bookingDetails.userEmail,
        subject: `🚖 Booking Status Update - ${bookingDetails.bookingId}`,
        content: `Status update failed for ${bookingDetails.bookingId}: ${bookingDetails.status} → ${newStatus}`,
        sentAt: new Date().toISOString(),
        type: 'status_update',
        bookingId: bookingDetails.bookingId,
        oldStatus: bookingDetails.status,
        newStatus: newStatus,
        status: 'failed',
        error: emailError.message
      };

      const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
      emailLogs.push(emailLog);
      localStorage.setItem('emailLogs', JSON.stringify(emailLogs));

      return {
        success: false,
        error: `Status update email failed: ${emailError.message}`,
        details: emailError
      };
    }
  } catch (error) {
    console.error('Error in status update email service:', error);
    return { success: false, error: error.message };
  }
}

// Create email content for status updates
function createStatusUpdateEmail(bookingDetails, newStatus) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const currentTime = new Date().toLocaleTimeString('en-IN');

  const statusMessages = {
    'confirmed': '✅ Your booking has been confirmed and is ready for pickup.',
    'in-progress': '🚗 Your taxi is on the way! Driver will contact you shortly.',
    'completed': '🎉 Your trip has been completed successfully. Thank you!',
    'cancelled': '❌ Your booking has been cancelled. Refund will be processed if applicable.'
  };

  return `
🚖 BOOKING STATUS UPDATE 🚖
═══════════════════════════════════════════════════════════

Dear ${bookingDetails.userName || bookingDetails.userEmail.split('@')[0]},

Your booking status has been updated!

📋 BOOKING DETAILS:
═══════════════════════════════════════════════════════════
🆔 Booking ID: ${bookingDetails.bookingId}
📍 Route: ${bookingDetails.pickupLocation} → ${bookingDetails.dropoffLocation}
📅 Date & Time: ${bookingDetails.pickupDate} at ${bookingDetails.pickupTime}

📊 STATUS UPDATE:
═══════════════════════════════════════════════════════════
Previous Status: ${(bookingDetails.status || 'unknown').toUpperCase()}
New Status: ${newStatus.toUpperCase()}
Updated On: ${currentDate} at ${currentTime}

💬 STATUS MESSAGE:
═══════════════════════════════════════════════════════════
${statusMessages[newStatus] || 'Your booking status has been updated.'}

📞 NEED HELP?
═══════════════════════════════════════════════════════════
📱 Customer Support: +91-9876543210
📧 Email Support: support@taxibooking.com

Thank you for choosing our service!

Best Regards,
Taxi Booking Team
═══════════════════════════════════════════════════════════
Email sent on: ${currentDate} at ${currentTime}
  `.trim();
}

// Email template for booking confirmation (for reference)
export const BOOKING_CONFIRMATION_TEMPLATE = `
Dear {{user_name}},

Your taxi booking has been confirmed! Here are the details:

Booking ID: {{booking_id}}
Pickup Location: {{pickup_location}}
Drop-off Location: {{dropoff_location}}
Date: {{pickup_date}}
Time: {{pickup_time}}
Car Type: {{car_type}}
Passengers: {{passenger_count}}
Total Price: ₹{{total_price}}
Status: {{booking_status}}
Booked on: {{created_at}}

Thank you for choosing our taxi service!

Best regards,
Taxi Booking Team
`;

// Email template for status updates (for reference)
export const STATUS_UPDATE_TEMPLATE = `
Dear {{user_name}},

Your booking status has been updated:

Booking ID: {{booking_id}}
Pickup: {{pickup_location}} → {{dropoff_location}}
Date & Time: {{pickup_date}} at {{pickup_time}}
Previous Status: {{old_status}}
New Status: {{new_status}}
Updated on: {{updated_at}}

Thank you for choosing our taxi service!

Best regards,
Taxi Booking Team
`;

/*
Setup Instructions for EmailJS:

1. Go to https://www.emailjs.com/ and create an account
2. Create a new email service (Gmail, Outlook, etc.)
3. Create email templates using the template examples above
4. Get your Service ID, Template ID, and User ID
5. Replace the placeholder values in EMAIL_CONFIG
6. Call initEmailJS() in your main App component

Template Variables to use in EmailJS:
- {{to_email}}
- {{user_name}}
- {{booking_id}}
- {{pickup_location}}
- {{dropoff_location}}
- {{pickup_date}}
- {{pickup_time}}
- {{car_type}}
- {{passenger_count}}
- {{total_price}}
- {{booking_status}}
- {{created_at}}
- {{old_status}}
- {{new_status}}
- {{updated_at}}
*/
