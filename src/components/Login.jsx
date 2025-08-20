import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const { login, ADMIN_EMAIL } = useAuth();
  const navigate = useNavigate();

  // Replace with your actual reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

  const isAdminLogin = email === ADMIN_EMAIL;

  async function handleSubmit(e) {
    e.preventDefault();

    // Check if admin login requires captcha
    if (isAdminLogin && !captchaValue) {
      toast.error('Please complete the captcha verification for admin login');
      return;
    }

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Login successful!');
      
      // Navigate based on role
      if (isAdminLogin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function onCaptchaChange(value) {
    setCaptchaValue(value);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 p-5">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-center mb-8 text-gray-800 text-3xl font-semibold">Login to Taxi Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-gray-600 font-medium text-sm">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-gray-600 font-medium text-sm">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {isAdminLogin && (
            <div>
              <label className="block mb-2 text-gray-600 font-medium text-sm">Admin Verification</label>
              <div className="mt-3">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={onCaptchaChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isAdminLogin && !captchaValue)}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-none rounded-lg text-lg font-semibold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-3"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6 pt-5 border-t border-gray-200">
          <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-primary-500 font-medium hover:underline">Register here</Link></p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mt-5 border-l-4 border-primary-500">
          <p className="text-sm text-gray-600 mb-1"><strong className="text-gray-800">Admin Login:</strong> Use email: {ADMIN_EMAIL}</p>
          <p className="text-sm text-gray-500 italic">Admin login requires captcha verification</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
