import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import logo from '../../assets/icons/gharfindr.png';
import axios from 'axios';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;

  useEffect(() => {
    if (!userData) {
      toast.error('No registration data found. Please register again.');
      navigate('/register');
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, userData, navigate]);

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://localhost:3000/api/auth/verify-email',
        {
          email: userData.email,
          verificationCode,
        },
        { withCredentials: true }
      );

      toast.success('Email verified successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await axios.post(
        'https://localhost:3000/api/auth/resend-verification',
        { email: userData.email },
        { withCredentials: true }
      );

      toast.success('Verification code resent successfully!');
      setCountdown(60);
    } catch (err) {
      toast.error('Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5">
      {/* Bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-16 h-16 bg-[#574FDB]/50 rounded-full blur-md animate-bubble-diag"></div>
        <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-blue-400/40 rounded-full blur-md animate-bubble-scale"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-400/40 rounded-full blur-md animate-bubble-diag-reverse"></div>
      </div>

      {/* Floating Logo */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20">
        <img src={logo} alt="Logo" className="h-16 w-16 rounded-full shadow-md border-2 border-white bg-white/80" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md mt-28 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-primary/20 p-8 flex flex-col items-center animate-fade-in z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FaEnvelope className="text-primary text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification code to <strong>{userData?.email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerification} className="w-full space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 text-lg bg-white/90 shadow-inner transition text-center tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 text-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="w-full mt-6 text-center">
          <p className="text-gray-600 mb-4">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0}
            className="text-primary hover:text-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        <div className="w-full mt-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center justify-center text-gray-600 hover:text-primary transition"
          >
            <FaArrowLeft className="mr-2" />
            Back to Register
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.8s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-bubble-diag {
          animation: bubbleDiag 1.2s ease-in-out infinite alternate;
        }
        .animate-bubble-diag-reverse {
          animation: bubbleDiagReverse 1.7s ease-in-out infinite alternate;
        }
        .animate-bubble-scale {
          animation: bubbleScale 1.5s ease-in-out infinite alternate;
        }
        @keyframes bubbleDiag {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, 20px) scale(1.12); }
        }
        @keyframes bubbleDiagReverse {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-18px, 18px) scale(1.08); }
        }
        @keyframes bubbleScale {
          0% { transform: scale(1); }
          100% { transform: scale(1.18); }
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;
