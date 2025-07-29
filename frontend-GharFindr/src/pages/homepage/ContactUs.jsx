import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ContactUs = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    rentalType: "",
    area: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          location: "",
          rentalType: "",
          area: "",
          message: "",
        });
      } else {
        setStatus("Failed to send message. Please try again.");
      }
    } catch (error) {
      setStatus("Error: Could not send message.");
    }
  };

  return (
    <section
      className="w-full min-h-screen py-12 px-4 md:px-0 fade-in-section"
      style={{ backgroundColor: "#F3F3FA" }}
    >
      {/* Hero Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-6 py-20 text-center"
      >
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg tracking-tight">
          <Typewriter
            words={["Contact Us"]}
            loop={1}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p className="mt-4 text-xl text-blue-700 max-w-2xl mx-auto">
          Have a question, suggestion, or need help? Reach out to our team and we’ll get back to you as soon as possible.
        </p>
      </motion.section>

      {/* Contact Info & Form */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white shadow-xl rounded-2xl p-8 border-t-4 border-blue-400 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Get in Touch</h2>
            <div className="space-y-4 text-blue-800 font-semibold">
              {[
                { icon: "📧", text: "gharfindr@gmail.com" },
                { icon: "📍", text: "Kathmandu, Nepal" },
                { icon: "📞", text: "+977-9862242899" },
                { icon: "🕘", text: "Mon-Fri: 9am - 6pm" },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-2xl mr-3">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white shadow-xl rounded-2xl p-8 border-t-4 border-blue-400 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Send Us a Message</h2>
            {status && (
              <p className={`mb-2 ${status.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {status}
              </p>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {[
                { label: "Your Full Name *", name: "fullName", type: "text", required: true },
                { label: "Your Phone Number *", name: "phone", type: "text", required: true },
                { label: "Email", name: "email", type: "email", required: false },
                { label: "Location *", name: "location", type: "text", required: true },
                { label: "Rental Type *", name: "rentalType", type: "text", required: true },
                { label: "Tole/Area *", name: "area", type: "text", required: true },
              ].map(({ label, name, type, required }) => (
                <div key={name}>
                  <label className="block text-gray-700">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={`Enter ${name}`}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required={required}
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-700">If Any</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write a message"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                className="w-full px-4 py-2 bg-[#574FDB] text-white font-semibold rounded-lg shadow-lg hover:bg-[#6C63FF] transition-colors duration-200"
              >
                Send →
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.section>
    </section>
  );
};

export default ContactUs;
