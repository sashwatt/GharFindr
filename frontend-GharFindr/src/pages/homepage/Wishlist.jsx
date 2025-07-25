// components/Wishlist.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "tailwindcss/tailwind.css";

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

const Wishlist = () => {
  const [wishlistRooms, setWishlistRooms] = useState([]);
  const [wishlistRoommates, setWishlistRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get wishlist IDs from localStorage
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        
        if (wishlist.length === 0) {
          setWishlistRooms([]);
          setWishlistRoommates([]);
          setLoading(false);
          return;
        }

        // Fetch all rooms and roommates
        const [roomsResponse, roommatesResponse] = await Promise.all([
          fetch("http://localhost:3000/api/rooms?show=true", {
            headers: {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") ?? '{}').token}`,
            },
          }),
          fetch("http://localhost:3000/api/roommates?show=true", {
            headers: {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") ?? '{}').token}`,
            },
          })
        ]);

        if (!roomsResponse.ok || !roommatesResponse.ok) {
          throw new Error(`HTTP error! status: ${roomsResponse.status} or ${roommatesResponse.status}`);
        }

        const allRooms = await roomsResponse.json();
        const allRoommates = await roommatesResponse.json();
        
        // Filter rooms and roommates that are in the wishlist
        const wishlistRoomsFiltered = allRooms.filter((room) => 
          wishlist.includes(room._id) || wishlist.includes(room.id)
        );
        
        const wishlistRoommatesFiltered = allRoommates.filter((roommate) => 
          wishlist.includes(roommate._id) || wishlist.includes(roommate.id)
        );
        
        setWishlistRooms(wishlistRoomsFiltered);
        setWishlistRoommates(wishlistRoommatesFiltered);
      } catch (error) {
        console.error("Error fetching wishlist data:", error);
        setError("Failed to load wishlist data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5">
        <div className="pt-20 px-6 pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5">
        <div className="pt-20 px-6 pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Error loading wishlist</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalWishlistItems = wishlistRooms.length + wishlistRoommates.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5">
      <div className="pt-20 px-6 pb-12">
        <div className={`bg-white rounded-2xl shadow-xl p-8 border border-gray-100 ${isVisible ? "fade-in-section" : ""}`}>
          <h2 className="text-3xl font-bold text-primary mb-8 text-center flex items-center justify-center">
            <span className="mr-3"></span>
            My Wishlist
            <span className="ml-3"></span>
          </h2>
          
          {totalWishlistItems === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Start exploring rooms and roommates and add them to your wishlist!</p>
              <div className="flex justify-center gap-4">
                <Link 
                  to="/rooms" 
                  className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Browse Rooms
                </Link>
                <Link 
                  to="/roommates" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Browse Roommates
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Wishlisted Rooms */}
              {wishlistRooms.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-blue-700 mb-6">Wishlisted Rooms</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistRooms.map((room) => (
                      <Link
                        key={room._id}
                        to={`/room-details/${room._id}`}
                        className="group relative bg-white p-4 shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="relative overflow-hidden rounded-lg mb-4">
                          <img
                            src={`http://localhost:3000/${room.roomImage}`}
                            alt="Room"
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ₹{room.rentPrice}/mo
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {room.roomDescription}
                          </h3>
                          <p className="text-gray-600 text-sm flex items-center">
                            📍 {room.address}
                          </p>
                          <p className="text-gray-600 text-sm flex items-center">
                            🏢 Floor {room.floor}
                          </p>
                          <p className="text-gray-600 text-sm flex items-center">
                            📞 {room.contactNo}
                          </p>
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">View Details</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlisted Roommates */}
              {wishlistRoommates.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-green-700 mb-6">Wishlisted Roommates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistRoommates.map((roommate) => (
                      <Link
                        key={roommate._id}
                        to={`/roommate-details/${roommate._id}`}
                        className="group relative bg-white p-4 shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="relative overflow-hidden rounded-lg mb-4">
                          <img
                            src={roommate.roommateImage ? `http://localhost:3000/${roommate.roommateImage}` : "/default-avatar.png"}
                            alt="Roommate"
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ₹{roommate.budget}/mo
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {roommate.name}
                          </h3>
                          <p className="text-gray-600 text-sm flex items-center">
                            👤 {roommate.age} years, {roommate.gender}
                          </p>
                          <p className="text-gray-600 text-sm flex items-center">
                            📍 {roommate.preferredLocation}
                          </p>
                          <p className="text-gray-600 text-sm flex items-center">
                            📞 {roommate.contactNo}
                          </p>
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-green-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">View Details</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;