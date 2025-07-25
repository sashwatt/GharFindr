import { useEffect } from "react";
import { Typewriter } from "react-simple-typewriter";

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

const TermsAndConditions = () => {
  useEffect(() => {
    // Add styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <section
      className="w-full min-h-screen py-12 px-4 md:px-0 fade-in-section"
      style={{ backgroundColor: "#F3F3FA" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-8 text-center tracking-tight drop-shadow-sm">
          <Typewriter
            words={["Terms and Conditions"]}
            loop={1}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p className="text-lg text-gray-700 mb-6 font-bold">
          Welcome to GharFindr. By using our platform, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
        </p>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">1. Acceptance of Terms</h2>
          <p className="text-lg text-gray-700">
            By accessing and using GharFindr, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you must discontinue using our services.
          </p>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">2. User Responsibilities</h2>
          <ul className="list-disc pl-6 mt-2 text-lg text-gray-700">
            <li>Provide accurate and up-to-date information.</li>
            <li>Comply with all applicable laws and regulations while using the platform.</li>
            <li>Be responsible for maintaining the confidentiality of your account details.</li>
          </ul>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">3. Rental Agreement</h2>
          <p className="text-lg text-gray-700">
            By renting any property through GharFindr, you agree to the rental terms provided by the property owner. All rentals are subject to availability, and we are not responsible for any issues with the rented property.
          </p>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">4. Payment Terms</h2>
          <p className="text-lg text-gray-700">
            Payments for rentals are processed through secure payment gateways. You agree to pay all applicable charges associated with the rental and any other fees specified in the rental agreement.
          </p>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">5. Cancellation and Refunds</h2>
          <p className="text-lg text-gray-700">
            Cancellation and refund policies are determined by the property owner. You must review and agree to these policies before confirming any rental. GharFindr is not responsible for cancellations or refunds.
          </p>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">6. Limitation of Liability</h2>
          <p className="text-lg text-gray-700">
            GharFindr is not liable for any damages or losses resulting from the use of our platform or services. We do not guarantee the accuracy or reliability of the information provided by third-party property owners.
          </p>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">7. Changes to Terms</h2>
          <p className="text-lg text-gray-700">
            GharFindr reserves the right to update these Terms and Conditions at any time. Any changes will be posted on this page, and we encourage you to review them periodically.
          </p>
        </section>
        <section className="bg-orange-50 border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">8. Contact Us</h2>
          <ul className="list-none pl-6 mt-2 text-lg text-gray-700">
            <li>Email: GharFindr20@gmail.com</li>
            <li>Phone: +977-9849066652</li>
            <li>Address: Boudha, Kathmandu 44600</li>
          </ul>
        </section>
      </div>
    </section>
  );
};

export default TermsAndConditions;
