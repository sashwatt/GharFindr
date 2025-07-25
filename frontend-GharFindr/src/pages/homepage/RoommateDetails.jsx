import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Wishlist from "../../components/wishlist.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const RoommateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roommate, setRoommate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [similarRoommates, setSimilarRoommates] = useState([]);

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

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (sendStatus) {
      const timer = setTimeout(() => setSendStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [sendStatus]);

  // Auth check on mount only
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.token) {
      toast.warn("You need to login first!", {
        position: "top-right",
        autoClose: 3000,
        pauseOnHover: true,
        closeOnClick: true,
        draggable: true,
      });
      navigate("/login", { state: { from: `/roommate-details/${id}` } });
    }
  }, [id, navigate]);

  // Fetch roommate details
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.token) return;

    // Fetch current roommate
    fetch(`https://localhost:3000/api/roommates/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Not found");
        return response.json();
      })
      .then((data) => {
        if (!data || Object.keys(data).length === 0 || Array.isArray(data)) {
          setRoommate(undefined);
        } else {
          setRoommate(data);
        }
      })
      .catch((error) => {
        setRoommate(undefined);
        console.error("Error fetching roommate:", error);
      });

    // Fetch all roommates for similar section
    fetch("https://localhost:3000/api/roommates?show=true", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        // Filter out the current roommate and pick 3
        const similar = (Array.isArray(data) ? data : [])
          .filter((r) => r._id !== id)
          .slice(0, 3);
        setSimilarRoommates(similar);
      })
      .catch((error) => {
        setSimilarRoommates([]);
        console.error("Error fetching similar roommates:", error);
      });
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setSendStatus("Message cannot be empty");
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      await fetch("https://localhost:3000/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: roommate.email || "GharFindr20@gmail.com",
          subject: `Inquiry about Roommate ${roommate.name}`,
          text: `User Message: ${message}\n\nRoommate Details:\n${JSON.stringify(roommate, null, 2)}`,
        }),
      });
      setSendStatus("Message sent successfully!");
      setMessage("");
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (error) {
      setSendStatus("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (roommate === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  if (roommate === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-600">Roommate not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className={`flex-grow pt-20 px-6 pb-12 ${isVisible ? "fade-in-section" : ""}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Roommate Details
          </h2>

          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg max-w-6xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row items-start justify-center w-full gap-8">
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <img
                  src={
                    roommate.roommateImage
                      ? `https://localhost:3000/${roommate.roommateImage}`
                      : "/default-avatar.png"
                  }
                  alt="Roommate"
                  className="w-full max-w-sm aspect-square object-cover rounded-lg shadow-lg border-4 border-blue-200 mb-4"
                />
              </div>

              <div className="w-full md:w-1/2 bg-white border border-gray-200 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {roommate.name}
                  </h3>
                  <Wishlist flatId={roommate._id} />
                </div>

                <div className="space-y-3 mt-4">
                  <DetailItem label="Budget" value={`₹${roommate.budget}/month`} />
                  <DetailItem label="Preferred Location" value={roommate.preferredLocation} />
                  <DetailItem label="Gender" value={roommate.gender} />
                  <DetailItem label="Age" value={roommate.age} />
                  <DetailItem label="Contact" value={roommate.contactNo} />
                  <DetailItem label="Bio" value={roommate.bio} />

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    >
                      Ask Anything About This Roommate
                    </button>
                    <button
                      onClick={() => window.open(`tel:${roommate.contactNo}`, "_self")}
                      className="flex-1 bg-[#574FDB] text-white py-2 px-4 rounded-md hover:bg-[#1193B7] transition"
                    >
                      Contact Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Roommates Section */}
          {similarRoommates.length > 0 && (
            <div className="max-w-6xl mx-auto mt-12 mb-8">
              <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Similar Roommates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {similarRoommates.map((mate) => (
                    <div key={mate._id} className="flex flex-col items-center bg-blue-50 rounded-2xl p-5 shadow group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl border border-blue-100">
                      <img
                        src={mate.roommateImage ? `https://localhost:3000/${mate.roommateImage}` : "/default-avatar.png"}
                        alt={mate.name}
                        className="w-24 h-24 object-cover rounded-full border-4 border-blue-200 mb-3"
                      />
                      <h4 className="text-lg font-bold text-blue-900 mb-1">{mate.name}</h4>
                      <div className="text-blue-700 text-sm mb-1">{mate.gender} | {mate.age}</div>
                      <div className="text-blue-700 text-sm mb-1 truncate">{mate.preferredLocation}</div>
                      <div className="text-blue-700 text-sm mb-2">Budget: ₹{mate.budget}</div>
                      <Link
                        to={`/roommate-details/${mate._id}`}
                        className="mt-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Ask About This Roommate</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Type your question here..."
                maxLength="500"
              />
              {sendStatus && (
                <div
                  className={`mb-4 text-sm px-4 py-2 rounded-md ${
                    sendStatus.includes("success")
                      ? "bg-green-100 text-green-800 border border-green-400"
                      : "bg-red-100 text-red-800 border border-red-400"
                  } transition-opacity duration-500`}
                  role="alert"
                  aria-live="polite"
                >
                  {sendStatus}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

export default RoommateDetails;

