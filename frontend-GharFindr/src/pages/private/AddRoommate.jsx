import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHome, FaUserPlus, FaArrowLeft, FaSignOutAlt, FaPlus } from "react-icons/fa";

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

const AddRoommate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    preferredLocation: "",
    budget: "",
    contactNo: "",
    bio: "",
  });
  const [image, setImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Helper function to get user role
  const getUserRole = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role || 'user';
      } catch (e) {
        return 'user';
      }
    }
    return 'user';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.gender || !form.age || !form.preferredLocation || !form.budget || !form.contactNo) {
      toast.error("Please fill all required fields.");
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("roommateImage", image);

    try {
      const res = await fetch("http://localhost:3000/api/roommates", {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") ?? '{}').token}`,
        },
      });
      if (res.ok) {
        toast.success("Roommate profile posted!");
        
        // Check user role and navigate accordingly
        const userRole = getUserRole();
        if (userRole === 'admin') {
          navigate("/adminDash");
        } else {
          navigate("/userListings");
        }
      } else {
        toast.error("Failed to post roommate profile.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5">
      {/* Sidebar */}
      <div className="bg-white shadow-2xl w-64 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2 text-center">
            Add Roommate
          </h2>
          <div className="text-center text-sm text-gray-600">
            <div className="font-bold text-primary">Create Listing</div>
            <div>Post yourself as roommate</div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate("/addRooms")}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700"
              >
                <FaHome className="mr-3" /> Add Room
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/userListings")}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700"
              >
                <FaUserPlus className="mr-3" /> My Listings
              </button>
            </li>
          </ul>
        </nav>

        <div className="space-y-2">
          <button
            onClick={goToDashboard}
            className="w-full px-4 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" /> Main Dashboard
          </button>
          <button
            onClick={logout}
            className="w-full px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 ${isVisible ? "fade-in-section" : ""}`}>
          <h3 className="text-2xl font-bold text-primary mb-6 flex items-center">
            <FaPlus className="mr-3" /> Post Yourself as Roommate
          </h3>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Image */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="roommateImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {image && (
                  <div className="mt-3">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Profile preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  min={16}
                />
              </div>

              {/* Preferred Location */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Preferred Location *
                </label>
                <input
                  type="text"
                  name="preferredLocation"
                  value={form.preferredLocation}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="e.g. Kathmandu, Lalitpur"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Budget (NPR) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  min={1000}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Short Bio */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-2">
                  Short Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Post as Roommate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoommate;