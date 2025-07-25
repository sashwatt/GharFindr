import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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

const faqs = [
  {
    question: "What is GharFindr?",
    answer:
      "GharFindr is a Nepali platform that helps you find rooms, flats, and roommates easily and securely. We connect seekers and owners for hassle-free renting and sharing.",
  },
  {
    question: "How do I search for a room, flat, or roommate?",
    answer:
      "Use the search bar on our homepage to filter by property type, location, and budget. You can also browse the 'Find Roommates' section for roommate options.",
  },
  {
    question: "How do I list my property or roommate profile?",
    answer:
      "Create an account, go to your dashboard, and click 'Add Room' or 'Add Roommate'. Fill in the details, upload photos, and submit. Your listing will be reviewed and published.",
  },
  {
    question: "Is GharFindr free to use?",
    answer:
      "Yes! Searching, browsing, and listing your property or roommate profile is completely free. We may offer premium features in the future.",
  },
  {
    question: "Are listings verified?",
    answer:
      "We manually review all listings and encourage users to report suspicious activity. Always verify details and visit the property before making payments.",
  },
  {
    question: "How do I contact a property owner or roommate?",
    answer:
      "Once you find a listing you like, use the contact options provided on the listing page to reach out directly to the owner or roommate.",
  },
  {
    question: "How do I edit or remove my listing?",
    answer:
      "Log in to your account, go to your dashboard, and you can edit or remove your listings anytime.",
  },
  {
    question: "How can I get support?",
    answer:
      "You can reach us via the Contact Us page, email (support@GharFindr.com), or WhatsApp. We’re here to help!",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Add styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="w-full min-h-screen py-12 px-4 md:px-0 fade-in-section"
      style={{ backgroundColor: "#F3F3FA" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-8 text-center tracking-tight drop-shadow-sm">
          <Typewriter
            words={["Help and Support"]}
            loop={1}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-blue-100 transition-all"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                onClick={() => toggleDropdown(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg md:text-xl font-semibold text-blue-800">
                  {faq.question}
                </span>
                <span className="ml-4 text-blue-400">
                  {openIndex === index ? (
                    <FaChevronUp className="text-2xl" />
                  ) : (
                    <FaChevronDown className="text-2xl" />
                  )}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5 text-blue-700 text-base md:text-lg overflow-hidden"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
