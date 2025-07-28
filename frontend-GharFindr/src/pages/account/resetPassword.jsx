import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import forgotBg from '../../assets/images/forgotbg.png';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

// Animation and styles
const styles = `
  .fade-in-section {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeIn 0.6s ease-out forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .bubble {
    position: fixed;
    bottom: 20px;
    right: 20px;
    min-width: 250px;
    max-width: 320px;
    background-color: white;
    border-radius: 20px 20px 0 20px;
    padding: 16px 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    z-index: 9999;
    animation: slideInUp 0.5s ease-out;
  }

  .bubble.success {
    border-left: 6px solid #22c55e;
  }

  .bubble.error {
    border-left: 6px solid #ef4444;
  }

  .bubble svg {
    flex-shrink: 0;
    font-size: 1.5rem;
  }

  @keyframes slideInUp {
    0% {
      transform: translateY(40px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({ msg: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { search } = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(search).get('token');

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const timeout = setTimeout(() => setIsVisible(true), 100);

    return () => {
      document.head.removeChild(styleSheet);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setNotification({ msg: 'Invalid or expired reset link.', type: 'error' });
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [token, navigate]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification({ msg: '', type: '' });
    }, 3000);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must include at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must include at least one lowercase letter.';
    }
    if (!/\d/.test(password)) {
      return 'Password must include at least one number.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return 'Password must include at least one special character.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showNotification(passwordError, 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://localhost:3000/api/auth/resetPassword', {
        token,
        newPassword,
      });
      toast.success(response.data.msg || 'Password reset successful!');
      setTimeout(() => {
        navigate("/login");
      }, 1500); // 1.5 seconds delay for user to see the toast
    } catch (error) {
      showNotification(error.response?.data?.msg || 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${forgotBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className={`w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-lg shadow-md ${
          isVisible ? 'fade-in-section' : ''
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
            <input
                type={showNewPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
                className="mt-1 w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {/* Password requirements */}
            {newPassword && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="space-y-1">
                  <div className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One number
                  </div>
                  <div className={`flex items-center ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One special character
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
            <input
                type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
                className="mt-1 w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>

      {/* Custom Notification Bubble */}
      {notification.msg && (
        <div className={`bubble ${notification.type}`}>
          {notification.type === 'success' ? (
            <AiOutlineCheckCircle className="text-green-500" />
          ) : (
            <AiOutlineCloseCircle className="text-red-500" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
