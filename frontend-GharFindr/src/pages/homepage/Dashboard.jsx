import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/Searchbar.jsx";
import { FaWhatsapp } from "react-icons/fa";
import { Typewriter } from "react-simple-typewriter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import leftGif from '../../assets/images/left.gif';
import rightGif from '../../assets/images/right.gif';

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
  
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #6C63FF;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(108, 99, 255, 0.3);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #6C63FF;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(108, 99, 255, 0.3);
  }
`;

const puzzles = [
  { 
    type: "slider", 
    question: "Drag the slider to 100% to prove you're human",
    icon: "🎯"
  },
  { 
    type: "checkbox", 
    question: "Check the box to confirm you're not a robot",
    icon: "🤖"
  },
  { 
    type: "math", 
    question: "What is 7 + 3?",
    answer: "10",
    icon: "🧮"
  },
  { 
    type: "color", 
    question: "Click the blue circle",
    correctColor: "blue",
    icon: "🎨"
  },
  { 
    type: "sequence", 
    question: "Click the numbers in order: 1, 2, 3",
    sequence: [1, 2, 3],
    icon: "🔢"
  },
  { 
    type: "word", 
    question: "Type the word 'GharFindr'",
    answer: "GharFindr",
    icon: "📝"
  },
  { 
    type: "pattern", 
    question: "Complete the pattern: ⭐, 🌟, ⭐, ?",
    answer: "🌟",
    icon: "✨"
  }
];

function getRandomPuzzle() {
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

const Dashboard = () => {
  const [flats, setFlats] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [findRoommateIndex, setFindRoommateIndex] = useState(0);
  const [sastoFlatIndex, setSastoFlatIndex] = useState(0);
  const [commercialFlatIndex, setCommercialFlatIndex] = useState(0);

  const navigate = useNavigate();

  const [sessionExpired, setSessionExpired] = useState(false);
  let inactivityTimeout = null;

  // State for Room Search
  const [roomType, setRoomType] = useState("");
  const [roomLocation, setRoomLocation] = useState("");

  // State for Roommate Search
  const [roommateGender, setRoommateGender] = useState("");
  const [roommateLocation, setRoommateLocation] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("rooms"); // "rooms" or "roommates"
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showPuzzle, setShowPuzzle] = useState(false);
  const [puzzle, setPuzzle] = useState(getRandomPuzzle());
  const [sliderValue, setSliderValue] = useState(0);
  const [robotChecked, setRobotChecked] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "room" or "roommate"

  const [mathAnswer, setMathAnswer] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [clickedNumbers, setClickedNumbers] = useState([]);
  const [wordAnswer, setWordAnswer] = useState("");
  const [patternAnswer, setPatternAnswer] = useState("");

  const resetInactivityTimeout = () => {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      setSessionExpired(true);
    }, 5 * 60 * 1000);
  };

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
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((data) => {
        const flatsArray = Array.isArray(data) ? data : [];
        setFlats(flatsArray);
      })
      .catch((error) => {
        console.error("Error fetching flats:", error);
        setFlats([]);
      });
  }, []);

  useEffect(() => {
    fetch("https://localhost:3000/api/roommates?show=true", {
      headers: {
        Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("user") ?? '{}').token}`
      },
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((data) => {
        const roommatesArray = Array.isArray(data) ? data : [];
        setRoommates(roommatesArray);
      })
      .catch((error) => {
        console.error("Error fetching roommates:", error);
        setRoommates([]);
      });
  }, []);

  useEffect(() => {
    if (flats && flats.length > 4) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % (flats.length - 3));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [flats]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event =>
      window.addEventListener(event, resetInactivityTimeout)
    );
    resetInactivityTimeout();

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, resetInactivityTimeout)
      );
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
    };
    // eslint-disable-next-line
  }, []);

  const getVisibleFlats = () => {
    if (!Array.isArray(flats) || flats.length === 0) return [];
    return flats.length <= 4 ? flats : flats.slice(activeIndex, activeIndex + 4);
  };

  const getVisibleRoommates = () => {
    if (!Array.isArray(roommates) || roommates.length === 0) return [];
    return roommates.length <= 4 ? roommates : roommates.slice(findRoommateIndex, findRoommateIndex + 4);
  };

  const getVisibleSastoFlats = () => {
    if (!Array.isArray(flats) || flats.length === 0) return [];
    const sastoFlats = flats.filter(flat => flat.rentPrice < 10000);
    return sastoFlats.length <= 4 ? sastoFlats : sastoFlats.slice(sastoFlatIndex, sastoFlatIndex + 4);
  };

  const getVisibleCommercialFlats = () => {
    if (!Array.isArray(flats) || flats.length === 0) return [];
    const commercialFlats = flats.filter(flat => flat.rentPrice > 30000);
    return commercialFlats.length <= 4 ? commercialFlats : commercialFlats.slice(commercialFlatIndex, commercialFlatIndex + 4);
  };

  // Handlers for search
  const handleRoomSearch = (e) => {
    e.preventDefault();
    if (roomType && roomLocation) {
      navigate(`/rooms?type=${encodeURIComponent(roomType)}&location=${encodeURIComponent(roomLocation)}`);
    } else {
      alert("Please select property type and enter location.");
    }
  };

  const handleRoommateSearch = (e) => {
    e.preventDefault();
    if (roommateGender && roommateLocation) {
      navigate(`/roommates?gender=${encodeURIComponent(roommateGender)}&location=${encodeURIComponent(roommateLocation)}`);
    } else {
      alert("Please select gender and enter location.");
    }
  };

  const handleUnifiedSearch = (e) => {
    e.preventDefault();
    if (searchType === "rooms") {
      navigate(`/rooms?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/roommates?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    if (searchType === "rooms") {
      navigate(`/room-details/${item._id}`);
    } else {
      navigate(`/roommate-details/${item._id}`);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const endpoint =
      searchType === "rooms"
        ? `https://localhost:3000/api/rooms?show=true`
        : `https://localhost:3000/api/roommates?show=true`;
    fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("user") ?? '{}').token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setSuggestions([]);
          return;
        }
        const filtered = data.filter(item => {
          if (searchType === "rooms") {
            return (
              item.roomDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          } else {
            return (
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.preferredLocation?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        });
        setSuggestions(filtered.slice(0, 8));
      })
      .catch(() => setSuggestions([]));
  }, [searchQuery, searchType]);

  const handlePostRoomClick = () => {
    const p = getRandomPuzzle();
    setPuzzle(p);
    setShowPuzzle(true);
    setPendingAction("room");
    setSliderValue(0);
    setRobotChecked(false);
  };

  const handlePostRoommateClick = () => {
    const p = getRandomPuzzle();
    setPuzzle(p);
    setShowPuzzle(true);
    setPendingAction("roommate");
    setSliderValue(0);
    setRobotChecked(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#2D2D2D]">
      {/* Animated SVG Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <svg width="100%" height="100%" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg-gradient" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-gradient)">
            <animate attributeName="x" values="0;20;0" dur="12s" repeatCount="indefinite" />
          </rect>
          <ellipse cx="80%" cy="10%" rx="300" ry="120" fill="#6C63FF" fillOpacity="0.07">
            <animate attributeName="cx" values="80%;85%;80%" dur="10s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="20%" cy="90%" rx="200" ry="80" fill="#FF6584" fillOpacity="0.08">
            <animate attributeName="cy" values="90%;85%;90%" dur="14s" repeatCount="indefinite" />
          </ellipse>
        </svg>
      </div>
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:px-0 fade-in-section" style={{ backgroundColor: "#F3F3FA" }}>
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#2D2D2D] mb-4 tracking-tight leading-tight text-center font-[Inter] drop-shadow-sm"
          >
            <span>
              <Typewriter
                words={['Smart Living For Everybody', 'GharFindr']}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1500}
              />
            </span>
          </h1>
          <p className="text-lg text-[#444444] mb-12 text-center max-w-2xl font-medium">
            Find your perfect room or roommate with ease. We provide a complete service for both seekers and sharers.
          </p>
          <div className="w-full flex flex-col md:flex-row gap-8 justify-center">
            <div className="flex-1 bg-white border border-purple-200 rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition duration-300 group">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-2xl text-purple-500">🏠</span>
              </div>
              <h2 className="text-xl font-bold text-[#2D2D2D] mb-2 font-[Inter]">Post a Room</h2>
              <p className="text-[#444444] mb-6 text-center text-sm">
                Got a spare room? Post your room and connect with seekers.
              </p>
              <button
                onClick={handlePostRoomClick}
                className="w-full bg-[#6C63FF] hover:bg-[#574FDB] text-white font-semibold px-6 py-2 rounded-md transition-all"
              >
                Post a Room
              </button>
            </div>
            <div className="flex-1 bg-white border border-purple-200 rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition duration-300 group">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-2xl text-purple-500">👫</span>
              </div>
              <h2 className="text-xl font-bold text-[#2D2D2D] mb-2 font-[Inter]">Post Yourself as a Roommate</h2>
              <p className="text-[#444444] mb-6 text-center text-sm">
                Need a room? Post your profile and get discovered.
              </p>
              <button
                onClick={handlePostRoommateClick}
                className="w-full bg-[#6C63FF] hover:bg-[#574FDB] text-white font-semibold px-6 py-2 rounded-md transition-all"
              >
                Post as Roommate
              </button>
            </div>
          </div>
          <div className="relative w-full max-w-2xl mx-auto mt-8">
            <form
              onSubmit={e => {
                e.preventDefault();
                setShowSuggestions(false);
                if (searchType === "rooms") {
                  navigate(`/rooms?search=${encodeURIComponent(searchQuery)}`);
                } else {
                  navigate(`/roommates?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow border border-purple-200"
              autoComplete="off"
            >
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="border border-purple-300 text-[#2D2D2D] font-semibold rounded-md px-4 py-2 focus:outline-none"
              >
                <option value="rooms">Rooms</option>
                <option value="roommates">Roommates</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={`Search ${searchType === "rooms" ? "rooms" : "roommates"} by location, description, etc.`}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#6C63FF] hover:bg-[#574FDB] text-white font-semibold px-6 py-2 rounded-md transition-all"
              >
                🔍 Search
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-purple-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((item) => (
                  <div
                    key={item._id}
                    onMouseDown={() => handleSuggestionClick(item)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-purple-50 transition"
                  >
                    {searchType === "rooms" ? (
                      <img
                        src={`https://localhost:3000/${item.roomImage}`}
                        alt="Room"
                        className="w-10 h-10 object-cover rounded-lg border"
                      />
                    ) : (
                      <img
                        src={
                          item.roommateImage
                            ? `https://localhost:3000/${item.roommateImage}`
                            : "/default-avatar.png"
                        }
                        alt="Profile"
                        className="w-10 h-10 object-cover rounded-full border"
                      />
                    )}
                    <div>
                      {searchType === "rooms" ? (
                        <>
                          <div className="font-semibold text-[#2D2D2D]">{item.roomDescription}</div>
                          <div className="text-sm text-[#666666]">{item.address}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-[#2D2D2D]">{item.name}</div>
                          <div className="text-sm text-[#666666]">{item.preferredLocation}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="pt-10 pb-8 px-4 md:px-0 fade-in-section bg-gradient-to-b from-white to-[#eaeaff]">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 shadow-2xl bg-white border border-purple-200">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-10 bg-[#6C63FF] rounded-full" />
            <h2 className="text-4xl font-extrabold text-[#6C63FF] tracking-tight drop-shadow-sm">
              Hot Deals
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {getVisibleFlats().length > 0 ? getVisibleFlats().map((flat, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-[#eaeaff] to-white p-5 shadow-lg rounded-2xl border border-purple-200 group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute top-4 right-4 bg-[#6C63FF] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  ₹{flat.rentPrice}/month
                </div>
                <img
                  src={`https://localhost:3000/${flat.roomImage}`}
                  alt="Room"
                  className="w-full h-44 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="text-lg font-bold text-[#2D2D2D] mb-1 truncate">{flat.roomDescription}</h3>
                <div className="flex items-center text-[#444444] text-sm mb-2">
                  <span className="mr-1">📍</span>
                  <p className="truncate">{flat.address}</p>
                </div>
                <Link
                  to={`/room-details/${flat._id}`}
                  className="inline-block mt-2 text-[#6C63FF] font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            )) : (
              <p className="text-center text-[#666666] col-span-full">No flats available at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* Roommates Section */}
      <section className="pt-10 pb-8 px-4 md:px-0 fade-in-section bg-gradient-to-b from-white to-[#ffe4e8]">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 shadow-2xl bg-white border border-[#ff6584]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-10 bg-[#FF6584] rounded-full" />
            <h2 className="text-4xl font-extrabold text-[#FF6584] tracking-tight drop-shadow-sm">
              Find a Roommate
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {getVisibleRoommates().length > 0 ? getVisibleRoommates().map((roommate, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-[#ffe4e8] to-white p-5 shadow-lg rounded-2xl border border-[#ff6584] group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <img
                  src={roommate.roommateImage ? `https://localhost:3000/${roommate.roommateImage}` : "/default-avatar.png"}
                  alt="Roommate"
                  className="w-full h-44 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="text-lg font-bold text-[#2D2D2D] mb-1 truncate">{roommate.name}</h3>
                <div className="flex items-center text-[#444444] text-sm mb-2">
                  <span className="mr-1">📍</span>
                  <p className="truncate">{roommate.preferredLocation}</p>
                </div>
                <Link
                  to={`/roommate-details/${roommate._id}`}
                  className="inline-block mt-2 text-[#FF6584] font-semibold hover:underline"
                >
                  View Profile
                </Link>
              </div>
            )) : (
              <p className="text-center text-[#666666] col-span-full">No roommates available at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sasto Flats Section */}
      <section className="pt-10 pb-8 px-4 md:px-0 fade-in-section bg-gradient-to-b from-white to-[#e1d5f0]">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 shadow-2xl bg-white border border-[#845EC2]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-10 bg-[#845EC2] rounded-full" />
            <h2 className="text-4xl font-extrabold text-[#845EC2] tracking-tight drop-shadow-sm">
              Affordable Flats
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {getVisibleSastoFlats().length > 0 ? getVisibleSastoFlats().map((flat, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-[#e1d5f0] to-white p-5 shadow-lg rounded-2xl border border-[#845EC2] group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute top-4 right-4 bg-[#845EC2] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  ₹{flat.rentPrice}/month
                </div>
                <img
                  src={`https://localhost:3000/${flat.roomImage}`}
                  alt="Room"
                  className="w-full h-44 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="text-lg font-bold text-[#2D2D2D] mb-1 truncate">{flat.roomDescription}</h3>
                <div className="flex items-center text-[#444444] text-sm mb-2">
                  <span className="mr-1">📍</span>
                  <p className="truncate">{flat.address}</p>
                </div>
                <Link
                  to={`/room-details/${flat._id}`}
                  className="inline-block mt-2 text-[#845EC2] font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            )) : (
              <p className="text-center text-[#666666] col-span-full">No affordable flats available at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* Commercial Flats Section */}
      <section className="pt-10 pb-16 px-4 md:px-0 fade-in-section bg-gradient-to-b from-white to-[#ffd7dd]">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 shadow-2xl bg-white border border-[#F94C66]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-10 bg-[#F94C66] rounded-full" />
            <h2 className="text-4xl font-extrabold text-[#F94C66] tracking-tight drop-shadow-sm">
              Commercial Flats
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {getVisibleCommercialFlats().length > 0 ? getVisibleCommercialFlats().map((flat, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-[#ffd7dd] to-white p-5 shadow-lg rounded-2xl border border-[#F94C66] group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute top-4 right-4 bg-[#F94C66] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  ₹{flat.rentPrice}/month
                </div>
                <img
                  src={`https://localhost:3000/${flat.roomImage}`}
                  alt="Room"
                  className="w-full h-44 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="text-lg font-bold text-[#2D2D2D] mb-1 truncate">{flat.roomDescription}</h3>
                <div className="flex items-center text-[#444444] text-sm mb-2">
                  <span className="mr-1">📍</span>
                  <p className="truncate">{flat.address}</p>
                </div>
                <Link
                  to={`/room-details/${flat._id}`}
                  className="inline-block mt-2 text-[#F94C66] font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            )) : (
              <p className="text-center text-[#666666] col-span-full">No commercial flats available at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sponsor GIFs Section */}
      <section className="my-16 px-4 md:px-0 max-w-7xl mx-auto fade-in-section">
        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          <div className="bg-white/40 backdrop-blur-md border border-purple-200 p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <img
              src={leftGif}
              alt="Sponsor GIF Left"
              className="w-64 h-40 object-cover rounded-xl shadow-md"
            />
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-purple-200 p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <img
              src={rightGif}
              alt="Sponsor GIF Right"
              className="w-64 h-40 object-cover rounded-xl shadow-md"
            />
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/9849066652"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-[#6C63FF] hover:bg-[#574FDB] text-white rounded-full p-3 shadow-xl transition hover:scale-110 z-50"
      >
        <FaWhatsapp className="w-8 h-8" />
      </a>

      {showPuzzle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-4 border-[#6C63FF]">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{puzzle.icon}</div>
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Verification Required</h2>
              <p className="text-[#666666]">{puzzle.question}</p>
            </div>

            {/* Slider Puzzle */}
            {puzzle.type === "slider" && (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderValue}
                    onChange={e => setSliderValue(Number(e.target.value))}
                    className="flex-1 mr-4 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-lg font-bold text-[#6C63FF] min-w-[3rem]">{sliderValue}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#6C63FF] to-[#574FDB] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sliderValue}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Checkbox Puzzle */}
            {puzzle.type === "checkbox" && (
              <div className="mb-6">
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-[#6C63FF] rounded-xl hover:bg-[#6C63FF]/5 transition-colors">
                  <input
                    type="checkbox"
                    id="robotCheck"
                    checked={robotChecked}
                    onChange={e => setRobotChecked(e.target.checked)}
                    className="w-6 h-6 text-[#6C63FF] border-2 border-[#6C63FF] rounded focus:ring-[#6C63FF]"
                  />
                  <label htmlFor="robotCheck" className="ml-3 text-lg font-medium text-[#2D2D2D] select-none">
                    I am not a robot
                  </label>
                </div>
              </div>
            )}

            {/* Math Puzzle */}
            {puzzle.type === "math" && (
              <div className="mb-6">
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={e => setMathAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full p-3 border-2 border-[#6C63FF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/20 text-center text-lg"
                  autoFocus
                />
              </div>
            )}

            {/* Color Puzzle */}
            {puzzle.type === "color" && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  {["red", "blue", "green", "yellow", "purple", "orange"].map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-16 h-16 rounded-full border-4 transition-all duration-200 hover:scale-110 ${
                        selectedColor === color ? 'border-[#6C63FF] shadow-lg' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Sequence Puzzle */}
            {puzzle.type === "sequence" && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        if (!clickedNumbers.includes(num)) {
                          setClickedNumbers([...clickedNumbers, num]);
                        }
                      }}
                      className={`w-16 h-16 rounded-xl border-2 font-bold text-lg transition-all duration-200 hover:scale-110 ${
                        clickedNumbers.includes(num) 
                          ? 'bg-[#6C63FF] text-white border-[#6C63FF]' 
                          : 'bg-gray-100 text-[#2D2D2D] border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2 text-sm text-[#666666]">
                  Clicked: {clickedNumbers.join(', ')}
                </div>
              </div>
            )}

            {/* Word Puzzle */}
            {puzzle.type === "word" && (
              <div className="mb-6">
                <input
                  type="text"
                  value={wordAnswer}
                  onChange={e => setWordAnswer(e.target.value)}
                  placeholder="Type the word exactly"
                  className="w-full p-3 border-2 border-[#6C63FF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/20 text-center text-lg"
                  autoFocus
                />
              </div>
            )}

            {/* Pattern Puzzle */}
            {puzzle.type === "pattern" && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {["⭐", "🌟", "💫", "✨"].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setPatternAnswer(emoji)}
                      className={`p-4 text-2xl rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                        patternAnswer === emoji 
                          ? 'border-[#6C63FF] bg-[#6C63FF]/10' 
                          : 'border-gray-300 hover:border-[#6C63FF]/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPuzzle(false);
                  setSliderValue(0);
                  setRobotChecked(false);
                  setMathAnswer("");
                  setSelectedColor("");
                  setClickedNumbers([]);
                  setWordAnswer("");
                  setPatternAnswer("");
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  let passed = false;
                  
                  if (puzzle.type === "slider") {
                    passed = sliderValue === 100;
                  } else if (puzzle.type === "checkbox") {
                    passed = robotChecked;
                  } else if (puzzle.type === "math") {
                    passed = mathAnswer === puzzle.answer;
                  } else if (puzzle.type === "color") {
                    passed = selectedColor === puzzle.correctColor;
                  } else if (puzzle.type === "sequence") {
                    passed = JSON.stringify(clickedNumbers) === JSON.stringify(puzzle.sequence);
                  } else if (puzzle.type === "word") {
                    passed = wordAnswer === puzzle.answer;
                  } else if (puzzle.type === "pattern") {
                    passed = patternAnswer === puzzle.answer;
                  }

                  if (passed) {
                    setShowPuzzle(false);
                    // Reset all states
                    setSliderValue(0);
                    setRobotChecked(false);
                    setMathAnswer("");
                    setSelectedColor("");
                    setClickedNumbers([]);
                    setWordAnswer("");
                    setPatternAnswer("");
                    
                    if (pendingAction === "room") {
                      navigate("/addrooms");
                    } else if (pendingAction === "roommate") {
                      navigate("/addroommate");
                    }
                  } else {
                    toast.error("Verification failed. Please try again.");
                  }
                }}
                className="px-6 py-2 bg-[#6C63FF] text-white rounded-lg font-medium hover:bg-[#574FDB] transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionExpired && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Session Expired</h2>
            <p className="mb-6 text-gray-700">You have been inactive for 5 minutes. Please login again to continue.</p>
            <button
              onClick={confirmLogout}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Login Again
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Dashboard;
