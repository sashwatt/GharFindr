import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UpdatePassword = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation
    const password = form.newPassword;
    if (password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("New password must include at least one capital letter.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error("New password must include at least one symbol.");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    toast.success("Password changed successfully!");
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    if (onClose) onClose();
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border-t-4 border-yellow-500">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">Update Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg pr-10"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowCurrent((prev) => !prev)}
            >
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg pr-10"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowNew((prev) => !prev)}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg pr-10"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;
