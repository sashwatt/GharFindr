import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaArrowLeft,
  FaEnvelope,
  FaIdCard,
  FaCalendarAlt,
  FaPhone,
  FaCrown,
  FaList
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import UpdatePassword from "./UpdatePassword";  

const primary = "#574FDB";

// Add global CSS for fade-in animation
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
`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // 

  // Inject fade-in styles and trigger animation
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
    const fetchUserData = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
          setError('No authentication found. Please log in.');
          setLoading(false);
          return;
        }
        const userData = JSON.parse(storedUser);
        if (userData.email || userData.name) {
          setUser(userData);
        } else {
          setError('Invalid user data. Please log in again.');
        }
      } catch {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => setShowLogoutModal(true);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleManageListings = () => {
    navigate("/userListings");
  };

  const gradientBg = "bg-gradient-to-br from-[#574FDB]/10 via-white to-[#574FDB]/5";
  const gradientBox = "bg-gradient-to-br from-[#574FDB]/5 to-[#574FDB]/10";

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${gradientBg}`}>
        <div className="max-w-md w-full p-6 rounded-2xl shadow-lg bg-white animate-pulse">
          <div className="h-24 w-24 mx-auto rounded-full bg-gray-200 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${gradientBg}`}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <FaUserCircle className="text-red-500 text-5xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <button onClick={handleGoBack} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
              <FaArrowLeft className="inline mr-2" /> Go Back
            </button>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
              <FaSignOutAlt className="inline mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 flex items-center justify-center ${gradientBg}`}>
      <div className={`w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 relative border-t-4 border-[#574FDB] ${isVisible ? "fade-in-section" : ""}`}>
        <div className="absolute -top-5 -left-5 w-20 h-20 bg-[#574FDB]/10 rounded-full blur-xl" />
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#574FDB]/10 rounded-full blur-xl" />

                 {/* Header */}
         <div className="flex justify-between items-center mb-6">
           <button
             onClick={handleGoBack}
             className="flex items-center text-[#574FDB] hover:underline font-medium"
           >
             <FaArrowLeft className="mr-2" /> Back
           </button>
           <div className="flex gap-2">
             <button
               onClick={handleManageListings}
               className="flex items-center bg-[#574FDB] hover:bg-[#6C63FF] text-white px-4 py-2 rounded-xl shadow"
             >
               <FaList className="mr-2" /> Manage Listings
             </button>
             {/* --- Add Update Password Button Here --- */}
             <button
               onClick={() => setShowPasswordModal(true)}
               className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl shadow"
             >
               Update Password
             </button>
             {/* --- End Update Password Button --- */}
             <button
               onClick={handleLogout}
               className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
             >
               <FaSignOutAlt className="mr-2" /> Logout
             </button>
           </div>
         </div>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full bg-[#574FDB] flex items-center justify-center shadow-lg text-white text-6xl">
              <FaUserCircle />
            </div>
            {user?.role === "admin" && (
              <div className="absolute bottom-0 right-0 bg-yellow-500 p-1 rounded-full shadow-md">
                <FaCrown className="text-white text-xs" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#574FDB]">{user?.name || "User"}</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
          <span className="mt-2 text-xs bg-[#574FDB]/10 text-[#574FDB] px-4 py-1 rounded-full font-medium border border-[#574FDB]/30">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "User"}
          </span>
        </div>

        {/* Profile Details */}
        <div className={`${gradientBox} rounded-2xl p-6 border border-[#574FDB]/20`}>
          <h3 className="text-lg font-semibold text-[#574FDB] mb-4">Profile Details</h3>
          <div className="space-y-4 text-sm">
            <ProfileRow icon={<FaUserCircle />} label="Name" value={user?.name} />
            <ProfileRow icon={<FaEnvelope />} label="Email" value={user?.email} />
            <ProfileRow icon={<FaIdCard />} label="User ID" value={user?.id || user?._id} />
            <ProfileRow icon={<FaCalendarAlt />} label="Created" value={moment(user?.createdAt).format("MMM DD, YYYY")} />
            <ProfileRow icon={<FaCalendarAlt />} label="Updated" value={moment(user?.updatedAt).format("MMM DD, YYYY")} />
            {user?.phone && <ProfileRow icon={<FaPhone />} label="Phone" value={user.phone} />}
          </div>
        </div>

        {/* Online Status */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center px-4 py-1 bg-green-50 border border-green-200 text-green-600 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></div>
            Online
          </div>
        </div>
      </div>
      {showLogoutModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-4 border-[#574FDB]">
      <h2 className="text-2xl font-bold text-[#574FDB] mb-4">Confirm Logout</h2>
      <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            sessionStorage.clear();
            setShowLogoutModal(false);
            toast.info("Logged out successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            navigate("/login");
          }}
          className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}

      {/* --- Add Update Password Modal Here --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UpdatePassword onClose={() => setShowPasswordModal(false)} />
        </div>
      )}
      {/* --- End Update Password Modal --- */}
    </div>
  );
};

const ProfileRow = ({ icon, label, value }) => (
  <div className="flex justify-between items-center border-b border-[#574FDB]/10 pb-2">
    <span className="flex items-center text-[#574FDB] font-medium">
      <span className="mr-2 text-[#574FDB]/60">{icon}</span> {label}
    </span>
    <span className="text-gray-800 font-semibold">{value || "-"}</span>
  </div>
);

export default Profile;
