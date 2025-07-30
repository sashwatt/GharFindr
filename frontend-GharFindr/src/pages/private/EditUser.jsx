import React, { useEffect, useState } from "react";
import { FaHome, FaUserPlus, FaUsers, FaSignOutAlt, FaChartBar, FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';

// Fade-in animation styles
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

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [roommates, setRoommates] = useState([]);

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
    fetch(`https://localhost:3000/api/user/${id}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          toast.error("User not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        toast.error("Error fetching user");
      });
  }, [id]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch("https://localhost:3000/api/user/customer", {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
      else if (data.users) setUsers(data.users);
    }).catch(() => setUsers([]));

    fetch("https://localhost:3000/api/rooms?show=true", {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setFlats(data);
      else if (data.rooms) setFlats(data.rooms);
    }).catch(() => setFlats([]));

    fetch("https://localhost:3000/api/roommates?show=true", {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setRoommates(data);
    }).catch(() => setRoommates([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");

      await axios.put(
        `https://localhost:3000/api/user/update/${id}`,
        user,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User updated successfully");
      navigate("/adminDash");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user"
      );
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className={`flex h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 ${isVisible ? "fade-in-section" : ""}`}>
      {/* Sidebar */}
      <div className="bg-white shadow-2xl w-64 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2 text-center">Admin Dashboard</h2>
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-bold text-primary">{flats.length}</div>
              <div>Rooms</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-primary">{roommates.length}</div>
              <div>Roommates</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-primary">{users.length}</div>
              <div>Users</div>
            </div>
          </div>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate("/adminDash")} className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700">
                <FaHome className="mr-3" /> Manage Rooms
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/adminDash")} className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700">
                <FaUserPlus className="mr-3" /> Manage Roommates
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/adminDash")} className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors flex items-center text-gray-700">
                <FaUsers className="mr-3" /> Manage Users
              </button>
            </li>
          </ul>
        </nav>
        <div className="space-y-2">
          <button onClick={() => navigate("/")} className="w-full px-4 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors flex items-center justify-center">
            <FaChartBar className="mr-2" /> Main Dashboard
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("isAdmin");
              sessionStorage.removeItem("user");
              navigate("/login");
            }}
            className="w-full px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 max-w-lg mx-auto ${isVisible ? "fade-in-section" : ""}`}>
          <h2 className="text-2xl font-bold mb-6 text-primary text-center">Edit User</h2>
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label className="block text-gray-700 font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Role</label>
              <select
                name="role"
                value={user.role}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-24 bg-blue-500 text-white py-1.5 rounded hover:bg-blue-600 transition text-sm mx-auto block flex items-center justify-center"
            >
              <FaSave className="mr-2" /> Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
