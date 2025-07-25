import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
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

const AddRooms = () => {
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState({
    roomDescription: "",
    floor: "",
    address: "",
    rentPrice: "",
    parking: "",
    contactNo: "",
    bathroom: "",
    roomImage: null,
  });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setRoomDetails((prev) => ({
      ...prev,
      roomImage: file,
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setRoomDetails((prev) => ({
        ...prev,
        contactNo: value,
      }));
    }
  };

  const handleRentPriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setRoomDetails((prev) => ({
      ...prev,
      rentPrice: value,
    }));
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

    // Validation check
    if (
      !roomDetails.roomDescription ||
      !roomDetails.floor ||
      !roomDetails.address ||
      !roomDetails.rentPrice ||
      !roomDetails.contactNo
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }

    if (roomDetails.contactNo.length !== 10) {
      toast.error("Contact number must be exactly 10 digits.");
      return;
    }

    const formData = new FormData();
    formData.append("roomDescription", roomDetails.roomDescription);
    formData.append("floor", roomDetails.floor);
    formData.append("address", roomDetails.address);
    formData.append("rentPrice", roomDetails.rentPrice);
    formData.append("parking", roomDetails.parking);
    formData.append("contactNo", roomDetails.contactNo);
    formData.append("bathroom", roomDetails.bathroom);
    if (roomDetails.roomImage) {
      formData.append("roomImage", roomDetails.roomImage);
    }

    try {
      // Post room details to backend
      await axios.post("http://localhost:3000/api/rooms", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for image upload
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") ?? '{}').token}`,
        },
      });

      toast.success("Room added successfully!");
      
      // Check user role and navigate accordingly
      const userRole = getUserRole();
      if (userRole === 'admin') {
        navigate("/adminDash");
      } else {
        navigate("/userListings");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error("Error adding room. Please try again.");
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
            Add New Room
          </h2>
          <div className="text-center text-sm text-gray-600">
            <div className="font-bold text-primary">Create Listing</div>
            <div>Post your room for rent</div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate("/addRoommate")}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700"
              >
                <FaUserPlus className="mr-3" /> Add Roommate
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/userListings")}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700"
              >
                <FaHome className="mr-3" /> My Listings
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
            <FaPlus className="mr-3" /> Add New Room
          </h3>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Image */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-2">
                  Room Image
                </label>
                <input
                  type="file"
                  name="roomImage"
                  onChange={handleImageUpload}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  accept="image/*"
                />
                {roomDetails.roomImage && (
                  <div className="mt-3">
                    <img
                      src={URL.createObjectURL(roomDetails.roomImage)}
                      alt="Room preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Room Description */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-2">
                  Room Description *
                </label>
                <input
                  type="text"
                  name="roomDescription"
                  value={roomDetails.roomDescription}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter room description"
                  required
                />
              </div>

              {/* Floor */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Floor *
                </label>
                <select
                  name="floor"
                  value={roomDetails.floor}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select floor</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={roomDetails.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter address"
                  required
                />
              </div>

              {/* Rent Price */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Rent Price *
                </label>
                <input
                  type="text"
                  name="rentPrice"
                  value={roomDetails.rentPrice}
                  onChange={handleRentPriceChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter rent price"
                  required
                />
              </div>

              {/* Parking */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Parking
                </label>
                <select
                  name="parking"
                  value={roomDetails.parking}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select parking availability</option>
                  <option value="available">Available</option>
                  <option value="not available">Not Available</option>
                </select>
              </div>

              {/* Contact No */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Contact No *
                </label>
                <input
                  type="text"
                  name="contactNo"
                  value={roomDetails.contactNo}
                  onChange={handlePhoneChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              {/* Bathroom */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Bathroom
                </label>
                <select
                  name="bathroom"
                  value={roomDetails.bathroom}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select number of bathrooms</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Add Room
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddRooms;
