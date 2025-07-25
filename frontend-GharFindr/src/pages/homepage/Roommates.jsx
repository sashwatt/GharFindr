import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

const Roommates = () => {
  const [roommates, setRoommates] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    // Add styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    fetch("https://localhost:3000/api/roommates?show=true", {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") ?? '{}').token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setRoommates(data))
      .catch((error) => console.error("Error fetching roommates:", error));
  }, []);

  // Get unique locations and genders for dropdowns
  const locations = Array.from(new Set(roommates.map(m => m.preferredLocation?.split(",")[0]?.trim()))).filter(Boolean);
  const genders = Array.from(new Set(roommates.map(m => m.gender))).filter(Boolean);

  // Filtering logic
  const filteredRoommates = roommates.filter(mate => {
    const matchesSearch =
      mate.name.toLowerCase().includes(search.toLowerCase()) ||
      mate.bio.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = location ? mate.preferredLocation?.toLowerCase().includes(location.toLowerCase()) : true;
    const matchesGender = gender ? mate.gender === gender : true;
    let matchesBudget = true;
    if (budget === "lt10k") matchesBudget = mate.budget < 10000;
    else if (budget === "10k-20k") matchesBudget = mate.budget >= 10000 && mate.budget <= 20000;
    else if (budget === "20k-30k") matchesBudget = mate.budget > 20000 && mate.budget <= 30000;
    else if (budget === "gt30k") matchesBudget = mate.budget > 30000;
    return matchesSearch && matchesLocation && matchesGender && matchesBudget;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 fade-in-section">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 text-center">Available Roommates</h1>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-blue-50 p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by name or bio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={gender}
          onChange={e => setGender(e.target.value)}
          className="px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Genders</option>
          {genders.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={budget}
          onChange={e => setBudget(e.target.value)}
          className="px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Budgets</option>
          <option value="lt10k">Below ₹10,000</option>
          <option value="10k-20k">₹10,000 - ₹20,000</option>
          <option value="20k-30k">₹20,000 - ₹30,000</option>
          <option value="gt30k">Above ₹30,000</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredRoommates.length > 0 ? (
          filteredRoommates.map((mate) => (
            <div key={mate._id} className="relative bg-blue-50 p-5 shadow-lg rounded-2xl border border-blue-100 group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
              {/* Budget Badge */}
              <div className="absolute top-4 right-4 bg-[#574FDB] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                ₹{mate.budget}/month
              </div>
              {/* Image */}
              <img 
                src={mate.roommateImage ? `https://localhost:3000/${mate.roommateImage}` : '/default-avatar.png'} 
                alt="Roommate" 
                className="w-full h-44 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105" 
              />
              {/* Name */}
              <h2 className="text-lg font-bold text-blue-900 mb-1 truncate">{mate.name}</h2>
              <div className="flex items-center text-blue-700 text-sm mb-1">
                <span className="mr-1">🎂</span>
                <span>{mate.age} | {mate.gender}</span>
              </div>
              <div className="flex items-center text-blue-700 text-sm mb-2">
                <span className="mr-1">📍</span>
                <span className="truncate">{mate.preferredLocation}</span>
              </div>
              {/* View Details Button */}
              <Link to={`/roommate-details/${mate._id}`} className="inline-block mt-3 bg-[#574FDB] hover:bg-[#6C63FF] text-white font-semibold px-5 py-2 rounded-lg shadow transition-all">
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-green-700">No roommates available.</p>
        )}
      </div>
    </div>
  );
};

export default Roommates;