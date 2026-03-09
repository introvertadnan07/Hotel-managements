import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers, FiBookmark, FiHome, FiTrendingUp,
  FiTrash2, FiEdit2, FiCheck, FiX, FiShield,
  FiDollarSign, FiEye, FiRefreshCw
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const TABS = ["Dashboard", "Users", "Bookings", "Hotels"];

const statusColors = {
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const roleColors = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  hotelOwner: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

const AdminPanel = () => {
  const { axios, user, role } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    if (role && role !== "admin") {
      toast.error("Admin access only");
      navigate("/");
    }
  }, [role]);

  useEffect(() => {
    if (activeTab === "Dashboard") fetchStats();
    else if (activeTab === "Users") fetchUsers();
    else if (activeTab === "Bookings") fetchBookings();
    else if (activeTab === "Hotels") fetchHotels();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/stats");
      if (data.success) setStats(data.stats);
    } catch { toast.error("Failed to load stats"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/users");
      if (data.success) setUsers(data.users);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/bookings");
      if (data.success) setBookings(data.bookings);
    } catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/hotels");
      if (data.success) setHotels(data.hotels);
    } catch { toast.error("Failed to load hotels"); }
    finally { setLoading(false); }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      if (data.success) {
        toast.success("Role updated!");
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        setEditingRole(null);
      }
    } catch { toast.error("Failed to update role"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/users/${userId}`);
      if (data.success) {
        toast.success("User deleted");
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch { toast.error("Failed to delete user"); }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.put(`/api/admin/bookings/${bookingId}/status`, { status });
      if (data.success) {
        toast.success("Status updated!");
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
      }
    } catch { toast.error("Failed to update status"); }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm("Delete hotel and all its rooms? This cannot be undone.")) return;
    try {
      const { data } = await axios.delete(`/api/admin/hotels/${hotelId}`);
      if (data.success) {
        toast.success("Hotel deleted");
        setHotels(prev => prev.filter(h => h._id !== hotelId));
      }
    } catch { toast.error("Failed to delete hotel"); }
  };

  const handleToggleVerified = async (hotelId) => {
    try {
      const { data } = await axios.put(`/api/admin/hotels/${hotelId}/verify`);
      if (data.success) {
        toast.success(data.hotel.isVerified ? "Hotel verified!" : "Verification removed");
        setHotels(prev => prev.map(h => h._id === hotelId ? { ...h, isVerified: data.hotel.isVerified } : h));
      }
    } catch { toast.error("Failed to update hotel"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-4 md:px-10 pb-16 transition-colors duration-300">
      {/* rest of your code remains exactly the same */}
    </div>
  );
};

export default AdminPanel;