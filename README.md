# Taxi Booking Application

A comprehensive taxi booking system built with React, Firebase, and modern web technologies. This application features user authentication, role-based access control, real-time booking management, and email notifications.

## Features

### 🔐 Authentication System
- User registration and login with Firebase Authentication
- Role-based access control (User/Admin)
- Admin verification with reCAPTCHA
- Protected routes for different user roles

### 🚗 Taxi Booking System
- Interactive time slot selection (similar to your provided image)
- Multiple car types with different pricing
- Pickup and drop-off location selection
- Passenger count selection
- Real-time booking confirmation

### 👨‍💼 Admin Dashboard
- View all taxi bookings
- User management
- Booking status updates
- Revenue and statistics tracking
- Admin-only access with security verification

### 📧 Email Notifications
- Automatic booking confirmation emails
- Status update notifications
- EmailJS integration for reliable email delivery

### 🎨 Modern UI/UX
- Responsive design for all devices
- Beautiful gradient backgrounds
- Interactive time slot grid
- Toast notifications for user feedback
- Professional styling with CSS

## Technology Stack

- **Frontend**: React 19.1.1 with Vite
- **Styling**: Tailwind CSS for modern, responsive design
- **Authentication**: Firebase Auth
- **Database**: Firestore (Firebase)
- **Email Service**: EmailJS
- **Routing**: React Router DOM
- **UI Components**: Tailwind CSS with custom components
- **Security**: reCAPTCHA for admin verification
- **Notifications**: React Toastify

## Prerequisites

Before running this application, make sure you have:

1. Node.js (v16 or higher)
2. npm or yarn package manager
3. Firebase project setup
4. EmailJS account setup
5. Google reCAPTCHA keys

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd taxi_booking
```

### 2. Install Dependencies
```bash
npm install
```

**Note**: Tailwind CSS is already configured and ready to use!

### 3. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and Firestore
4. Get your Firebase config object
5. Update `src/firebase/config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. EmailJS Setup
1. Go to [EmailJS](https://www.emailjs.com/) and create an account
2. Create an email service (Gmail, Outlook, etc.)
3. Create email templates for booking confirmations
4. Update `src/services/emailService.js` with your EmailJS credentials:

```javascript
const EMAIL_CONFIG = {
  serviceId: 'your_service_id',
  templateId: 'your_template_id',
  userId: 'your_user_id'
};
```

### 5. reCAPTCHA Setup
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/)
2. Register your site and get site key
3. Update the site key in `src/components/Login.jsx`:

```javascript
const RECAPTCHA_SITE_KEY = "your-recaptcha-site-key";
```

### 6. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### For Users:
1. Register with email and password
2. Login to access user dashboard
3. Book taxi by selecting:
   - Pickup and drop-off locations
   - Date and time
   - Car type and passenger count
4. Receive email confirmation

### For Admin:
1. Login with admin email: `rushikeshrpawar72@gmail.com`
2. Complete reCAPTCHA verification
3. Access admin dashboard to:
   - View all bookings
   - Manage users
   - Update booking statuses
   - View statistics

## Admin Login Details
- **Email**: rushikeshrpawar72@gmail.com
- **Password**: rushi9763
- **Note**: Admin verification requires reCAPTCHA completion

## Key Features Implementation

### Time Slot Selection
The time slot selection UI matches your provided image with:
- Grid layout for time slots
- 15-minute intervals from 12:00 AM to 11:45 PM
- Visual selection feedback with hover effects
- Responsive design for mobile devices

### Role-Based Access
- Users can only access booking functionality
- Admin has access to all bookings and user management
- Protected routes prevent unauthorized access
- Automatic role detection based on email

### Email Integration
- Automatic emails on booking confirmation
- Professional email templates
- Booking details included in emails
- Multiple user email support

### Security Features
- Firebase Authentication with email/password
- reCAPTCHA for admin login verification
- Protected routes with role checking
- Input validation and sanitization

## Project Structure

```
src/
├── components/
│   ├── Login.jsx              # User login with admin captcha
│   ├── Register.jsx           # User registration
│   ├── UserDashboard.jsx      # Taxi booking interface
│   ├── AdminDashboard.jsx     # Admin management panel
│   ├── ProtectedRoute.jsx     # Route protection
│   ├── Auth.css              # Authentication styles
│   ├── UserDashboard.css     # User dashboard styles
│   └── AdminDashboard.css    # Admin dashboard styles
├── contexts/
│   └── AuthContext.jsx       # Authentication state management
├── firebase/
│   └── config.js             # Firebase configuration
├── services/
│   └── emailService.js       # Email notification service
├── App.jsx                   # Main app with routing
├── App.css                   # Global styles
├── index.css                 # Base CSS reset
└── main.jsx                  # App entry point
```

## Customization

### Adding New Car Types
Update the `carTypes` array in `UserDashboard.jsx`:

```javascript
const carTypes = [
  { value: 'standard', label: 'Standard Car', price: 500 },
  { value: 'premium', label: 'Premium Car', price: 800 },
  { value: 'luxury', label: 'Luxury Car', price: 1200 },
  { value: 'suv', label: 'SUV', price: 1000 }
  // Add new car types here
];
```

### Modifying Time Slots
The time slots are automatically generated in 15-minute intervals. To change this, modify the `timeSlots` array in `UserDashboard.jsx`.

### Styling Customization
- Modify CSS files for different color schemes
- Update gradient backgrounds in component CSS files
- Customize responsive breakpoints
- Change time slot grid layout

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## Troubleshooting

### Common Issues:

1. **Firebase errors**:
   - Check your Firebase configuration in `config.js`
   - Ensure Firestore and Authentication are enabled
   - Verify API keys and project settings

2. **Email not sending**:
   - Verify EmailJS setup and credentials
   - Check email service configuration
   - Ensure template IDs are correct

3. **reCAPTCHA not working**:
   - Ensure correct site key for your domain
   - Check if domain is registered in reCAPTCHA console
   - Verify reCAPTCHA v2 is being used

4. **Build errors**:
   - Check all dependencies are installed
   - Verify Node.js version compatibility
   - Clear node_modules and reinstall if needed

5. **Authentication issues**:
   - Check Firebase Auth configuration
   - Verify email/password provider is enabled
   - Check user role assignment logic

### Performance Tips:
- Use React.memo for components that don't need frequent re-renders
- Implement lazy loading for large components
- Optimize images and assets
- Use Firebase security rules for data protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Firebase and EmailJS documentation
- Create an issue in the repository
- Contact the development team

---

**Note**: Remember to replace all placeholder credentials (Firebase config, EmailJS keys, reCAPTCHA keys) with your actual values before deploying to production.
"# taxi_booking" 
