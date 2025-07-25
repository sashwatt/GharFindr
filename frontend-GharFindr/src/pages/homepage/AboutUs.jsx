import React, { useEffect } from "react";
import { Typewriter } from "react-simple-typewriter";
import { FaRegBuilding, FaHandsHelping, FaSmile } from "react-icons/fa";

import aboutus1 from "../../assets/images/aboutus1.png";
import aboutus2 from "../../assets/images/aboutus2.png";

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

const AboutUs = () => {
  useEffect(() => {
    // Add styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <section className="w-full min-h-screen py-12 px-4 md:px-0 fade-in-section" style={{ backgroundColor: "#F3F3FA" }}>
      {/* Hero Section (text only, no image) */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight leading-tight">
          <Typewriter
            words={['About GharFindr']}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p className="mt-4 text-xl text-blue-700 max-w-2xl leading-relaxed">
          GharFindr is your reliable partner for finding and sharing rooms and flats across Nepal.
          We connect people with the right homes and roommates—quickly, easily, and with trust.
        </p>
      </section>

      {/* Timeline/Steps Section */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 bg-white/80 rounded-2xl shadow-lg p-8 border-l-4 border-primary mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-primary mb-2">Our Mission</h2>
            <p className="text-blue-700 text-lg">
              We aim to simplify your post or search for a room or roommate through a smooth, trustworthy, verified  and user-focused experience very conviniently.
            </p>
          </div>
          <div className="flex-1 bg-white/80 rounded-2xl shadow-lg p-8 border-l-4 border-blue-400">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Our Commitment</h2>
            <p className="text-blue-700 text-lg">
              We're not just a service - we're a growing community. Whether you're posting or searching, we’re here to make your housing journey simple, respectful, and stress-free.
            </p>
          </div>
        </div>
      </section>

      {/* Image Divider (now aboutus2) */}
      <div className="max-w-4xl mx-auto my-12 flex justify-center">
        <img
          src={aboutus2}
          alt="Our Team"
          className="rounded-2xl shadow-xl w-full max-w-lg h-64 object-cover border-4 border-blue-100"
        />
      </div>

      {/* Statistics Section */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white/80 rounded-3xl shadow-lg p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 flex flex-col items-center">
            <FaRegBuilding className="text-blue-500 text-5xl mb-2" />
            <h3 className="text-4xl font-extrabold text-blue-600 mb-1">100+</h3>
            <p className="text-blue-800 font-semibold">Verified Properties</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <FaHandsHelping className="text-blue-500 text-5xl mb-2" />
            <h3 className="text-2xl font-bold text-blue-600 mb-1">Always Here to Help</h3>
            <p className="text-blue-800 font-semibold text-center">
              Available 24/7
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <FaSmile className="text-blue-500 text-5xl mb-2" />
            <h3 className="text-4xl font-extrabold text-blue-600 mb-1">100+</h3>
            <p className="text-blue-800 font-semibold">Happy Customers</p>
          </div>
        </div>
      </section>

      </section>
  );
};

export default AboutUs;