import React, { useEffect, useState } from "react";
import { FaUser, FaArrowLeft, FaSave, FaSignOutAlt } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';

const EditRoommate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const roommate = state?.roommate;

  const [formData, setFormData] = useState({
    roommateImage: "",
    name: "",
    gender: "",
    age: "",
    preferredLocation: "",
    budget: "",
    contactNo: "",
    bio: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token) return token;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.token;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (roommate) {
          const roommateImage = roommate.roommateImage
            ? `http://localhost:3000/${roommate.roommateImage}`
            : "";

          setFormData({
            roommateImage: roommateImage,
            name: roommate.name || "",
            gender: roommate.gender || "",
            age: roommate.age || "",
            preferredLocation: roommate.preferredLocation || "",
            budget: roommate.budget || "",
            contactNo: roommate.contactNo || "",
            bio: roommate.bio || "",
          });
          setLoading(false);
        } else {
          // Fetch data from API
          
          const token = getAuthToken();
          const response = await fetch(`http://localhost:3000/api/roommates/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            const roommateImage = data.roommateImage
              ? `http://localhost:3000/${data.roommateImage}`
              : "";

            setFormData({
              roommateImage: roommateImage,
              name: data.name || "",
              gender: data.gender || "",
              age: data.age || "",
              preferredLocation: data.preferredLocation || "",
              budget: data.budget || "",
              contactNo: data.contactNo || "",
              bio: data.bio || "",
            });
          } else {
            const errorText = await response.text();
            console.error('Failed to load roommate data:', response.status, errorText);
            setError(`Failed to load roommate data. Status: ${response.status}`);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading roommate data:", error);
        setError("Error loading roommate data");
        setLoading(false);
      }
    };

    loadData();
  }, [id, roommate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData({ ...formData, roommateImage: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      // Validate required fields
      const requiredFields = ['name', 'gender', 'age', 'preferredLocation', 'budget', 'contactNo'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      const formDataToSend = new FormData();
      
      // Add all form data except image URLs
      Object.keys(formData).forEach((key) => {
        if (key !== 'roommateImage') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add image file if selected
      if (selectedImage) {
        formDataToSend.append('roommateImage', selectedImage);
      }

      const endpoint = `/api/roommates/${id}`;

      // Log the actual FormData contents

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });


      if (response.ok) {
        const result = await response.json();
        toast.success('Roommate updated successfully');
        navigate("/adminDash");
      } else {
        const errorData = await response.text();
        
        // More detailed error message based on status
        if (response.status === 500) {
          toast.error(`Server error (500). This might be due to:\n- Invalid data format\n- Missing required fields\n- Database connection issue\n\nError details: ${errorData}\n\nCheck console for full details.`);
        } else if (response.status === 400) {
          toast.error(`Bad request (400). Please check all required fields are filled correctly.\n\nError: ${errorData}`);
        } else if (response.status === 401) {
          toast.error(`Unauthorized (401). Please login again.`);
        } else if (response.status === 404) {
          toast.error(`Not found (404). The roommate might not exist.`);
        } else {
          toast.error(`Failed to update roommate. Status: ${response.status}\n\nError: ${errorData}`);
        }
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <h2 className="text-xl font-bold">Error Loading Roommate Data</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate("/adminDash")} 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5">
      {/* Sidebar */}
      <div className="bg-white shadow-2xl w-64 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2 text-center">
            Admin Dashboard
          </h2>
          <div className="text-center text-sm text-gray-600">
            Update Roommate
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate("/adminDash")}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700"
              >
                <FaUser className="mr-3" /> Back to Dashboard
              </button>
            </li>
          </ul>
        </nav>

        <div className="space-y-2">
          <button
            onClick={() => navigate("/")}
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

      {/* Update Form */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-primary mb-8 text-center flex items-center justify-center">
            <FaUser className="mr-3" />
            Update Roommate Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {formData.roommateImage && (
                  <img
                    src={formData.roommateImage}
                    alt="Profile Preview"
                    className="mt-3 w-32 h-32 object-cover rounded-lg border"
                  />
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="18"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Preferred Location
                </label>
                <input
                  type="text"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength="10"
                  required
                />
              </div>
            </div>

            {/* Budget and Bio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                <FaSave className="mr-2" />
                Update Roommate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoommate;
