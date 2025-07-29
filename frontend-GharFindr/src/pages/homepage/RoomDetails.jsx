import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
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

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [similarFlats, setSimilarFlats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
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

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (sendStatus) {
      const timer = setTimeout(() => setSendStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [sendStatus]);

  // Centralized auth + fetch
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const user = JSON.parse(sessionStorage.getItem("user") || "null");

      if (!user || !user.token) {
        toast.warning("You need to login first!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate("/login", { state: { from: `/room-details/${id}` } });
        return;
      }

      try {
        const [flatResponse, similarResponse] = await Promise.all([
          axios.get(`https://localhost:3000/api/rooms/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get("https://localhost:3000/api/rooms?show=true", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setFlat(flatResponse.data);
        const similar = similarResponse.data
          .filter((f) => f._id !== id)
          .slice(0, 3);
        setSimilarFlats(similar);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          toast.warning("You need to login first!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate("/login", { state: { from: `/room-details/${id}` } });
        }
      }
    };

    checkAuthAndFetch();
  }, [navigate, id]);

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
          to: "GharFindr20@gmail.com",
          subject: `Question about Flat ${flat._id}`,
          text: `User Message: ${message}\n\nFlat Details:\n${JSON.stringify(flat, null, 2)}`,
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

  const handlePayment = async (payment_method) => {
    const url = `https://localhost:3000/api/esewa/create/${id}`;
    const data = {
      amount: flat.rentPrice,
      products: [
        { product: flat.roomDescription, amount: flat.rentPrice, quantity: 1 },
      ],
      payment_method,
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const responseData = await response.json();
        esewaCall(responseData.formData);
      } else {
        console.error("Failed to fetch:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const esewaCall = (formData) => {
    const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (var key in formData) {
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", formData[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
  };

  if (!flat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col min-h-screen ${isVisible ? "fade-in-section" : ""}`}>
        <div className="flex-grow pt-20 px-6 pb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Room Details
          </h2>

          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg max-w-6xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row items-start justify-center w-full gap-8">
              <div className="w-full md:w-1/2">
                <img
                  src={`https://localhost:3000/${flat.roomImage}`}
                  alt="Room"
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>

              <div className="w-full md:w-1/2 bg-white border border-gray-200 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {flat.roomDescription}
                  </h3>
                  <Wishlist flatId={flat._id} />
                </div>
                <div className="space-y-3 mt-4">
                  <DetailItem label="Price" value={`₹${flat.rentPrice}/month`} />
                  <DetailItem label="Address" value={flat.address} />
                  <DetailItem label="Floor" value={flat.floor} />
                  <DetailItem label="Parking" value={flat.parking} />
                  <DetailItem label="Contact" value={flat.contactNo} />
                  <DetailItem label="Bathrooms" value={flat.bathroom} />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Ask Anything About This Room
                    </button>
                    <button
                      onClick={() => window.open(`tel:${flat.contactNo}`, '_self')}
                      className="flex-1 bg-[#574FDB] text-white py-2 px-4 rounded-md hover:bg-[#1193B7] transition-colors duration-200"
                    >
                      Contact Now
                    </button>
                  </div>
                  <button
                    onClick={() => handlePayment("esewa")}
                    className="mt-4 w-64 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Book Now with eSewa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Similar Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarFlats.map((similarFlat) => (
                <Link
                  key={similarFlat._id}
                  to={`/room-details/${similarFlat._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={`https://localhost:3000/${similarFlat.roomImage}`}
                    alt="Similar property"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2">
                      {similarFlat.roomDescription}
                    </h4>
                    <p className="text-gray-600 mb-1">
                      ₹{similarFlat.rentPrice}/month
                    </p>
                    <p className="text-gray-600 text-sm">{similarFlat.address}</p>
                  </div>
                </Link>
              ))}
            </div>
            {similarFlats.length === 0 && (
              <p className="text-center text-gray-600">
                No similar properties found
              </p>
            )}
          </div>
        </div>

        {/* Email Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Ask About This Flat</h3>
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

export default RoomDetails;
