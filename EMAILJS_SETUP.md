# 📧 EmailJS Setup Guide for Taxi Booking System

## Step 1: Create EmailJS Account
1. Go to: https://www.emailjs.com/
2. Click "Sign Up" and create free account
3. Verify your email address

## Step 2: Add Email Service
1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **"Gmail"** 
4. Click **"Connect Account"**
5. Login with: `rushikeshrpawar72@gmail.com`
6. Allow EmailJS permissions
7. **Copy the Service ID** (looks like: `service_abc123`)

## Step 3: Create Email Template
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. **Template Name:** `Taxi Booking Confirmation`
4. **Subject:** `🚖 Taxi Booking Confirmation - {{booking_id}}`
5. **Content:** Copy this template:

```
Dear {{user_name}},

Your taxi booking has been confirmed!

📋 BOOKING DETAILS:
🆔 Booking ID: {{booking_id}}
📧 Customer: {{user_email}}
📍 Pickup: {{pickup_location}}
🎯 Drop-off: {{dropoff_location}}
📅 Date: {{pickup_date}}
⏰ Time: {{pickup_time}}
💰 Price: ₹{{total_price}}
✅ Status: {{status}}

📞 Contact: {{support_phone}}
📧 Support: {{admin_email}}

Thank you for choosing our service!

Best Regards,
Taxi Booking Team
```

6. **Save template** and copy **Template ID** (looks like: `template_xyz789`)

## Step 4: Get Public Key
1. Go to **"Account"** → **"General"**
2. Copy **"Public Key"** (looks like: `user_abc123`)

## Step 5: Update Code
Open `src/services/emailService.js` and replace:

```javascript
const EMAIL_CONFIG = {
  enabled: true,
  serviceId: 'YOUR_SERVICE_ID',     // Replace with your Service ID
  templateId: 'YOUR_TEMPLATE_ID',   // Replace with your Template ID  
  userId: 'YOUR_USER_ID',           // Replace with your Public Key
  adminEmail: 'rushikeshrpawar72@gmail.com',
  fromName: 'Taxi Booking System',
  supportPhone: '+91-9876543210'
};
```

**Example with real IDs:**
```javascript
const EMAIL_CONFIG = {
  enabled: true,
  serviceId: 'service_abc123',      // Your actual Service ID
  templateId: 'template_xyz789',    // Your actual Template ID
  userId: 'user_def456',            // Your actual Public Key
  adminEmail: 'rushikeshrpawar72@gmail.com',
  fromName: 'Taxi Booking System',
  supportPhone: '+91-9876543210'
};
```

## Step 6: Test Email System
1. **Save the file** after updating IDs
2. **Restart your React app:** `npm run dev`
3. **Register/Login** with any email
4. **Book a taxi** with all details
5. **Check your email inbox** - Real email should arrive!

## Step 7: Create Status Update Template (Optional)
1. Create **second template** for status updates
2. **Subject:** `🚖 Booking Status Update - {{booking_id}}`
3. **Content:**
```
Dear {{user_name}},

Your booking status has been updated!

📋 BOOKING: {{booking_id}}
📍 Route: {{pickup_location}} → {{dropoff_location}}
📅 Date: {{pickup_date}} at {{pickup_time}}

📊 STATUS UPDATE:
Previous: {{old_status}}
Current: {{new_status}}
Updated: {{updated_at}}

📞 Support: {{support_phone}}

Best Regards,
Taxi Booking Team
```

## 🎯 What Will Happen:
- ✅ **Real emails sent** from `rushikeshrpawar72@gmail.com`
- ✅ **To customer's email** when they book taxi
- ✅ **Professional templates** with all booking details
- ✅ **Status update emails** when admin changes status
- ✅ **Email logs** in admin dashboard
- ✅ **Free service** - 200 emails/month

## 🚨 Important Notes:
- **Free plan:** 200 emails per month
- **Gmail required:** Use rushikeshrpawar72@gmail.com
- **Template variables:** Must match exactly ({{booking_id}}, {{user_name}}, etc.)
- **Test thoroughly:** Send test booking to verify

## 🔧 Troubleshooting:
- **Email not sending:** Check Service ID, Template ID, User ID
- **Template errors:** Verify variable names match
- **Gmail issues:** Ensure Gmail account connected properly
- **Quota exceeded:** Check EmailJS dashboard for usage

## ✅ Success Indicators:
- Console shows: "✅ REAL EMAIL SENT SUCCESSFULLY!"
- Customer receives email in inbox
- Admin dashboard shows "✅ Sent" status
- EmailJS dashboard shows sent emails
