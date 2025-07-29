
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

const Rooms = () => {
  const [flats, setFlats] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    // Add styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    fetch("https://localhost:3000/api/rooms?show=true", {
      headers: {
        Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("user") ?? '{}').token}`
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFlats(data);
        } else if (Array.isArray(data.rooms)) {
          setFlats(data.rooms);
        } else {
          console.error("Unexpected response format:", data);
          setFlats([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        setFlats([]);
      });
  }, []);

  // Get unique locations for dropdown
  const locations = Array.from(new Set(flats.map(f => f.address?.split(",")[0]?.trim()))).filter(Boolean);

  // Filtering logic
  const filteredFlats = flats.filter(flat => {
    const matchesSearch =
      flat.roomDescription.toLowerCase().includes(search.toLowerCase()) ||
      flat.address.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = location ? flat.address.toLowerCase().includes(location.toLowerCase()) : true;
    let matchesPrice = true;
    if (price === "lt10k") matchesPrice = flat.rentPrice < 10000;
    else if (price === "10k-20k") matchesPrice = flat.rentPrice >= 10000 && flat.rentPrice <= 20000;
    else if (price === "20k-30k") matchesPrice = flat.rentPrice > 20000 && flat.rentPrice <= 30000;
    else if (price === "gt30k") matchesPrice = flat.rentPrice > 30000;
    return matchesSearch && matchesLocation && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 fade-in-section">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 text-center">Available Rooms</h1>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-blue-50 p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by address or description..."
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
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Prices</option>
          <option value="lt10k">Below ₹10,000</option>
          <option value="10k-20k">₹10,000 - ₹20,000</option>
          <option value="20k-30k">₹20,000 - ₹30,000</option>
          <option value="gt30k">Above ₹30,000</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredFlats.length > 0 ? (
          filteredFlats.map((flat) => (
            <div key={flat._id} className="relative bg-blue-50 p-5 shadow-lg rounded-2xl border border-blue-100 group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
              {/* Price Badge */}
              <div className="absolute top-4 right-4 bg-[#574FDB] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                ₹{flat.rentPrice}/month
              </div>
              {/* Image */}
              <img src={`https://localhost:3000/${flat.roomImage}`} alt="Room" className="w-full h-44 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105" />
              {/* Description */}
              <h2 className="text-lg font-bold text-blue-900 mb-1 truncate">{flat.roomDescription}</h2>
              <div className="flex items-center text-blue-700 text-sm mb-2">
                <span className="mr-1">📍</span>
                <span className="truncate">{flat.address}</span>
              </div>
              {/* Contact Number */}
              <div className="flex items-center text-blue-700 text-sm mb-2">
                <span className="mr-1">📞</span>
                <span className="truncate">{flat.contactNo}</span>
              </div>
              {/* View Details Button */}
              <Link to={`/room-details/${flat._id}`} className="inline-block mt-3 bg-[#574FDB] hover:bg-[#6C63FF] text-white font-semibold px-5 py-2 rounded-lg shadow transition-all">
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-blue-700">No rooms available.</p>
        )}
      </div>
    </div>
  );
};

export default Rooms;
