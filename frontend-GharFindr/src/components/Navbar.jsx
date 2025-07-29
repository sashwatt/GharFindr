// Navbar.jsx
import { useEffect, useState } from "react";
import { FaCaretDown, FaHeart, FaSignOutAlt, FaUser, FaHome, FaBed, FaUsers, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/icons/gharfindr.png";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedRole = sessionStorage.getItem("role");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setUser(null);
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
  };

  // Helper to check if a path is active
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/">
                <img src={logo} alt="Logo" className="h-14 w-20 cursor-pointer" />
              </Link>
              
             
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors duration-200 flex items-center border-b-2 ${isActive("/") ? "text-primary font-bold border-primary" : "text-gray-700 border-transparent hover:text-primary"}`}
              >
                <FaHome className="mr-1" />
                Home
              </Link>
              <Link 
                to="/rooms" 
                className={`font-medium transition-colors duration-200 flex items-center border-b-2 ${isActive("/rooms") ? "text-primary font-bold border-primary" : "text-gray-700 border-transparent hover:text-primary"}`}
              >
                <FaBed className="mr-1" />
                Rooms
              </Link>
              <Link 
                to="/roommates" 
                className={`font-medium transition-colors duration-200 flex items-center border-b-2 ${isActive("/roommates") ? "text-primary font-bold border-primary" : "text-gray-700 border-transparent hover:text-primary"}`}
              >
                <FaUsers className="mr-1" />
                Roommates
              </Link>
              <Link 
                to="/aboutus" 
                className={`font-medium transition-colors duration-200 flex items-center border-b-2 ${isActive("/aboutus") ? "text-primary font-bold border-primary" : "text-gray-700 border-transparent hover:text-primary"}`}
              >
                <FaInfoCircle className="mr-1" />
                About
              </Link>
              <Link 
                to="/contactus" 
                className={`font-medium transition-colors duration-200 flex items-center border-b-2 ${isActive("/contactus") ? "text-primary font-bold border-primary" : "text-gray-700 border-transparent hover:text-primary"}`}
              >
                <FaEnvelope className="mr-1" />
                Contact
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/admindash"
                  className={`font-semibold transition-colors duration-200 flex items-center border-b-2 ${isActive("/admindash") ? "text-primary font-bold border-primary" : "text-primary hover:text-primary-dark border-transparent"}`}
                >
                  <FaUser className="mr-1" />
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative user-menu">
                  <button
                    className="flex items-center gap-2 font-medium text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <FaUser size={16} className="text-white" />
                    </div>
                    <span className="hidden sm:block">{user.name}</span>
                    <FaCaretDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50"
                      onClick={(e) => e.stopPropagation()}
                    > 
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors duration-200 font-medium"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="mr-3 text-primary" />
                        Profile
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors duration-200 font-medium"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaHeart className="mr-3 text-red-500" />
                        Wishlist
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-4 border-[#6C63FF]">
            <h2 className="text-2xl font-bold text-[#6C63FF] mb-4">Confirm Logout</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
