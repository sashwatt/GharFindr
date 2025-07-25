import React, { useState } from "react";
import { toast } from "react-toastify";

const UpdatePassword = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Adjust the endpoint and headers as per your backend
      const res = await fetch("/api/user/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      toast.success("Password updated successfully!");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border-t-4 border-yellow-500">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">Update Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;
