import axios from "axios";
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/icons/gharfindr.png"; // Adjust path if needed

// Password strength meter
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  if (password.length >= 16) score++; // bonus for long passwords
  if (password.length > 32) score = 0; // too long is invalid
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

const passwordRequirements = [
  { label: '8-32 characters', test: (pw) => pw.length >= 8 && pw.length <= 32 },
  { label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'At least one number', test: (pw) => /\d/.test(pw) },
  { label: 'At least one special character', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("All fields are required");
      return false;
    }
    // Strong password policy
    const password = formData.password;
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,32}$/;
    if (!passwordPolicy.test(password)) {
      toast.error(
        "Password must be 8-32 characters, include uppercase, lowercase, number, and special character."
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          "https://localhost:3000/api/auth/register",
          formData
        );
        if (response.data.success) {
          toast.success("User registered successfully!");
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          navigate("/login");
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Something went wrong!";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5">
      {/* Animated Bubbles - more and smaller */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-16 h-16 bg-[#574FDB]/50 rounded-full blur-md animate-bubble-diag"></div>
        <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-blue-400/40 rounded-full blur-md animate-bubble-scale"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-400/40 rounded-full blur-md animate-bubble-diag-reverse"></div>
        <div className="absolute bottom-16 right-12 w-20 h-20 bg-[#574FDB]/40 rounded-full blur-md animate-bubble-scale-reverse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-blue-400/30 rounded-full blur-md animate-bubble-diag"></div>
        <div className="absolute bottom-24 left-1/2 w-28 h-28 bg-green-400/30 rounded-full blur-md animate-bubble-diag-reverse"></div>
      </div>
      {/* Floating Logo */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20">
        <img src={logo} alt="Logo" className="h-16 w-16 rounded-full shadow-md border-2 border-white bg-white/80" />
      </div>
      {/* Glassmorphism Card */}
      <div
        className="relative w-full max-w-xl mt-28 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-primary/20 p-12 flex flex-col items-center animate-fade-in
        hover:scale-102 transition-transform duration-300 group z-10"
        style={{ boxShadow: "0 8px 32px 0 rgba(20,163,199,0.08), 0 1.5px 8px 0 rgba(20,163,199,0.06)" }}
      >
        {/* Tabs */}
        <div className="flex w-full mb-8 z-10">
          <Link
            to="/login"
            className="flex-1 py-3 rounded-t-xl text-xl font-semibold transition bg-gray-100 text-gray-700 text-center hover:bg-primary/10"
            style={{ borderTopRightRadius: 0, borderBottomLeftRadius: 0 }}
          >
            Login
          </Link>
          <button
            className="flex-1 py-3 rounded-t-xl text-xl font-semibold transition bg-primary text-white shadow"
            style={{ borderTopLeftRadius: 0, borderBottomRightRadius: 0 }}
            disabled
          >
            Signup
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-7 z-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary text-xl">
              <FaUser />
            </span>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-14 pr-4 py-4 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 text-lg bg-white/90 shadow-inner transition"
              autoComplete="name"
              required
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary text-xl">
              <FaEnvelope />
            </span>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-14 pr-4 py-4 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 text-lg bg-white/90 shadow-inner transition"
              autoComplete="email"
              required
            />
          </div>
          <div className="relative">
            <div className="relative w-full bg-white/90 rounded-xl">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full pl-12 pr-12 py-4 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 text-lg shadow-inner transition bg-transparent"
                autoComplete="new-password"
                required
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary text-xl pointer-events-none">
                <FaLock />
              </span>
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary text-xl cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {/* Password strength and requirements */}
            {(passwordFocused || formData.password) && (
              <div className="mt-2 ml-1">
                {/* Strength bar */}
                <div className="flex items-center mb-1">
                  <span className={`h-2 w-16 rounded-full mr-2 
                    ${getPasswordStrength(formData.password) === 'weak' ? 'bg-red-400' : ''}
                    ${getPasswordStrength(formData.password) === 'medium' ? 'bg-yellow-400' : ''}
                    ${getPasswordStrength(formData.password) === 'strong' ? 'bg-green-500' : ''}
                  `}></span>
                  <span className={`text-xs font-semibold 
                    ${getPasswordStrength(formData.password) === 'weak' ? 'text-red-500' : ''}
                    ${getPasswordStrength(formData.password) === 'medium' ? 'text-yellow-600' : ''}
                    ${getPasswordStrength(formData.password) === 'strong' ? 'text-green-600' : ''}
                  `}>
                    {formData.password ? getPasswordStrength(formData.password).toUpperCase() : ''}
                  </span>
                </div>
                {/* Requirements checklist */}
                <ul className="text-xs space-y-1">
                  {passwordRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 
                        ${req.test(formData.password) ? 'bg-green-400' : 'bg-gray-300 border border-gray-400'}`}></span>
                      <span className={req.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary text-xl">
              <FaLock />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Re-type password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-14 pr-12 py-4 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 text-lg bg-white/90 shadow-inner transition"
              autoComplete="new-password"
              required
            />
            <span
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary text-xl cursor-pointer"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={0}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 text-xl shadow-md transition"
          >
            Create Account
          </button>
        </form>
        <div className="w-full flex justify-end mt-4 z-10">
          <p className="text-gray-600 text-base">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
      {/* Animation keyframes */}
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
        .hover\\:scale-102:hover {
          transform: scale(1.02);
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
        .animate-bubble-scale-reverse {
          animation: bubbleScaleReverse 2s ease-in-out infinite alternate;
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
        @keyframes bubbleScaleReverse {
          0% { transform: scale(1); }
          100% { transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
};

export default Register;