import React, { useEffect, useState } from "react";
import { FaUserPlus, FaUserEdit, FaTrashAlt, FaHome, FaUser, FaUsers, FaSignOutAlt, FaArrowLeft, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

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

const UserListings = () => {
  const [activeMenu, setActiveMenu] = useState("manageFlats");
  const [flats, setFlats] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

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

  // Get current user info
  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

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

  // Fetch user's rooms
  useEffect(() => {
    const fetchUserRooms = async () => {
      try {
        const token = getAuthToken();
        const currentUser = getCurrentUser();
        
        
        if (!token || !currentUser) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:3000/api/rooms", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        
        if (response.ok) {
          const data = await response.json();
          
          // Filter rooms to show only user's own rooms
          const userRooms = Array.isArray(data) 
            ? data.filter(room => room.userId === currentUser._id || room.userId === currentUser.id)
            : [];
          
          setFlats(userRooms);
        } else {
          console.error('Failed to fetch user rooms:', response.status);
          setFlats([]);
        }
      } catch (error) {
        console.error("Error fetching user rooms:", error);
        setFlats([]);
      }
    };

    fetchUserRooms();
  }, []);

  // Fetch user's roommates
  useEffect(() => {
    const fetchUserRoommates = async () => {
      try {
        const token = getAuthToken();
        const currentUser = getCurrentUser();
        
        
        if (!token || !currentUser) {
          return;
        }

        const response = await fetch("http://localhost:3000/api/roommates", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        
        if (response.ok) {
          const data = await response.json();
          
          // Filter roommates to show only user's own roommates
          const userRoommates = Array.isArray(data) 
            ? data.filter(roommate => roommate.userId === currentUser._id || roommate.userId === currentUser.id)
            : [];
          
          setRoommates(userRoommates);
        } else {
          console.error('Failed to fetch user roommates:', response.status);
          setRoommates([]);
        }
      } catch (error) {
        console.error("Error fetching user roommates:", error);
        setRoommates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoommates();
  }, []);

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          setFlats(flats.filter((flat) => flat._id !== roomId));
          toast.success("Room deleted successfully");
        } else {
          toast.error("Failed to delete room");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error("Failed to delete room");
      }
    }
  };

  const handleDeleteRoommate = async (roommateId) => {
    if (window.confirm("Are you sure you want to delete this roommate listing?")) {
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:3000/api/roommates/${roommateId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          setRoommates(roommates.filter((mate) => mate._id !== roommateId));
          toast.success("Roommate listing deleted successfully");
        } else {
          toast.error("Failed to delete roommate listing");
        }
      } catch (error) {
        console.error("Error deleting roommate:", error);
        toast.error("Failed to delete roommate listing");
      }
    }
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goToDashboard = () => {
    navigate("/");
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
            <h2 className="text-xl font-bold">Error Loading Your Listings</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate("/")} 
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
            My Listings
          </h2>
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-bold text-primary">{flats.length}</div>
              <div>My Rooms</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-primary">{roommates.length}</div>
              <div>My Roommates</div>
            </div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveMenu("manageFlats")}
                className={`w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center ${
                  activeMenu === "manageFlats" ? "bg-primary text-white" : "text-gray-700"
                }`}
              >
                <FaHome className="mr-3" /> My Rooms
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenu("manageRoommates")}
                className={`w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center ${
                  activeMenu === "manageRoommates" ? "bg-primary text-white" : "text-gray-700"
                }`}
              >
                <FaUserPlus className="mr-3" /> My Roommates
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
          {/* Header with back button and add buttons */}
          <div className="flex items-center justify-between mb-6">
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/addRooms")}
                className="flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" /> Add Room
              </button>
              <button
                onClick={() => navigate("/addRoommate")}
                className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" /> Add Roommate
              </button>
            </div>
          </div>
          
          {/* My Rooms */}
          {activeMenu === "manageFlats" && (
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center">
                <FaHome className="mr-3" /> My Rooms ({flats.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Room Image</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Description</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Floor</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Address</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Price</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Contact</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flats.length > 0 ? (
                      flats.map((flat, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 border border-gray-200">
                            {flat.roomImage && (
                              <img
                                src={`http://localhost:3000/${flat.roomImage}`}
                                alt="Room"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 border border-gray-200 max-w-xs truncate">
                            {flat.roomDescription}
                          </td>
                          <td className="px-4 py-3 border border-gray-200">{flat.floor}</td>
                          <td className="px-4 py-3 border border-gray-200 max-w-xs truncate">{flat.address}</td>
                          <td className="px-4 py-3 border border-gray-200 font-semibold">₹{flat.rentPrice}</td>
                          <td className="px-4 py-3 border border-gray-200">{flat.contactNo}</td>
                          <td className="px-4 py-3 border border-gray-200">
                            <div className="flex space-x-2">
                              <Link
                                to={{
                                  pathname: `/adminUpdate/${flat._id}`,
                                  state: { flat },
                                }}
                              >
                                <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm flex items-center">
                                  <FaUserEdit className="mr-1" /> Edit
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDeleteRoom(flat._id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm flex items-center"
                              >
                                <FaTrashAlt className="mr-1" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center px-4 py-8 text-gray-500">
                          You haven't added any rooms yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* My Roommates */}
          {activeMenu === "manageRoommates" && (
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center">
                <FaUserPlus className="mr-3" /> My Roommates ({roommates.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Image</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Gender</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Age</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Location</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Budget</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Contact</th>
                      <th className="px-4 py-3 border border-gray-200 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roommates.length > 0 ? (
                      roommates.map((mate, idx) => (
                        <tr key={mate._id || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 border border-gray-200 text-center">
                            <img
                              src={mate.roommateImage ? `http://localhost:3000/${mate.roommateImage}` : '/default-avatar.png'}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover mx-auto"
                            />
                          </td>
                          <td className="px-4 py-3 border border-gray-200 font-semibold">{mate.name}</td>
                          <td className="px-4 py-3 border border-gray-200">{mate.gender}</td>
                          <td className="px-4 py-3 border border-gray-200">{mate.age}</td>
                          <td className="px-4 py-3 border border-gray-200 max-w-xs truncate">{mate.preferredLocation}</td>
                          <td className="px-4 py-3 border border-gray-200 font-semibold">₹{mate.budget}</td>
                          <td className="px-4 py-3 border border-gray-200">{mate.contactNo}</td>
                          <td className="px-4 py-3 border border-gray-200">
                            <div className="flex space-x-2">
                              <Link
                                to={{
                                  pathname: `/editRoommate/${mate._id}`,
                                  state: { roommate: mate },
                                }}
                              >
                                <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm flex items-center">
                                  <FaUserEdit className="mr-1" /> Edit
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDeleteRoommate(mate._id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm flex items-center"
                              >
                                <FaTrashAlt className="mr-1" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center px-4 py-8 text-gray-500">
                          You haven't added any roommate listings yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListings; 