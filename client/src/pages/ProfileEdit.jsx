import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Title from "../components/Title";
import { FiUser, FiMail, FiPhone, FiSave, FiCamera } from "react-icons/fi";

const ProfileEdit = () => {
  const { axios, user, setUser } = useAppContext();
  const { user: clerkUser }      = useUser();

  const [username, setUsername] = useState("");
  const [phone, setPhone]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);

  // Pre-fill from context user
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || username.trim().length < 2) {
      return toast.error("Name must be at least 2 characters");
    }
    try {
      setLoading(true);
      const { data } = await axios.put("/api/user/profile", {
        username: username.trim(),
        phone: phone.trim(),
      });
      if (data.success) {
        toast.success("Profile updated! ✅");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Update context user
        if (setUser) setUser(data.user);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="pt-32 text-center dark:text-white">
      <p>Please login to view your profile.</p>
    </div>
  );

  return (
    <div className="pt-28 pb-16 px-4 md:px-16 lg:px-24 xl:px-32 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Title title="My Profile" subTitle="Manage your personal information." align="left" />

      <div className="max-w-2xl mt-10">

        {/* Avatar section */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
              {(user.image || clerkUser?.imageUrl) ? (
                <img
                  src={user.image || clerkUser?.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            {/* Camera icon — Clerk manages photo via their UI */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-black dark:bg-white rounded-full flex items-center justify-center shadow cursor-pointer"
              title="Photo managed by Clerk account">
              <FiCamera className="text-white dark:text-black text-xs" />
            </div>
          </div>
          <div>
            <p className="text-xl font-playfair text-gray-900 dark:text-white">{user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Profile photo managed via Clerk account settings
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <FiUser className="text-gray-400" /> Display Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              minLength={2}
              maxLength={50}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition"
              required
            />
          </div>

          {/* Email — read only (managed by Clerk) */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <FiMail className="text-gray-400" /> Email Address
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full border border-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 text-gray-400 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed bg-gray-50"
            />
            <p className="text-xs text-gray-400 mt-1">Email is managed by your Clerk account and cannot be changed here.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <FiPhone className="text-gray-400" /> Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              maxLength={20}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl text-sm font-medium hover:opacity-80 transition disabled:opacity-60"
            >
              <FiSave />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            {saved && (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium animate-pulse">
                ✅ Saved!
              </span>
            )}
          </div>
        </form>

        {/* Account info card */}
        <div className="mt-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Account Type</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">{user.role || "Guest"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Member Since</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Phone</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.phone || "Not set"}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileEdit;