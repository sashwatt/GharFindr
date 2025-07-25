import {
  FaEnvelope,
  FaFileAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPhoneSquareAlt,
  FaQuestionCircle,
  FaUser,
} from "react-icons/fa";
import "tailwindcss/tailwind.css";
import parts from "../assets/icons/gharfindr.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-blue-200 via-white to-blue-300 text-blue-900 py-10 mt-10 border-t border-blue-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Left Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="w-5 h-5 text-blue-800" />
              <p className="text-sm font-semibold">Boudha, Kathmandu 44600</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaEnvelope className="w-5 h-5 text-blue-800" />
              <p className="text-sm font-semibold">gharfindr@gmail.com</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaPhoneAlt className="w-5 h-5 text-blue-800" />
              <p className="text-sm font-semibold">+977-9849066652</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaUser className="w-5 h-5 text-blue-800" />
              <p className="text-sm font-semibold">Sashwat Pyakurel</p>
            </div>
          </div>

          {/* Center Logo */}
          <div className="flex justify-center">
            <a href="/">
              <img src={parts} alt="GharFindr Logo" className="w-28 md:w-32" />
            </a>
          </div>

          {/* Right Section */}
          <div className="flex md:justify-end">
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <FaFileAlt className="w-5 h-5 text-blue-800" />
                <a
                  href="/termscondition"
                  className="text-sm font-semibold text-blue-900 hover:text-blue-600 transition"
                >
                  Terms and Condition
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaQuestionCircle className="w-5 h-5 text-blue-800" />
                <a
                  href="/helpandsupport"
                  className="text-sm font-semibold text-blue-900 hover:text-blue-600 transition"
                >
                  Help and Support
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhoneSquareAlt className="w-5 h-5 text-blue-800" />
                <a
                  href="/contactus"
                  className="text-sm font-semibold text-blue-900 hover:text-blue-600 transition"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center mt-10 text-xs text-blue-600 font-medium">
          &copy; 2025 GharFindr — Sashwat Pyakurel. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
