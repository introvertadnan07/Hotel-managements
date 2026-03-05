import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const Dashboard = () => {
  const { currency, user, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0
  });

  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // ================= FETCH DASHBOARD =================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data } = await axios.post("/api/bookings/hotel");

      if (data.success) {
        const bookings = data.dashboardData?.bookings || [];

        setDashboardData({
          bookings,
          totalBookings: data.dashboardData?.totalBookings || 0,
          totalRevenue: data.dashboardData?.totalRevenue || 0
        });

        setFilteredBookings(bookings);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  // ================= STATUS FILTER =================
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(dashboardData.bookings);
    } else {
      const filtered = dashboardData.bookings.filter((b) =>
        statusFilter === "paid" ? b.isPaid : !b.isPaid
      );

      setFilteredBookings(filtered);
    }
  }, [statusFilter, dashboardData.bookings]);

  // ================= REALTIME BOOKINGS =================
  useEffect(() => {
    socket.on("new-booking", (booking) => {
      toast.success("New booking received!");

      setDashboardData((prev) => ({
        ...prev,
        bookings: [booking, ...prev.bookings],
        totalBookings: prev.totalBookings + 1,
        totalRevenue: prev.totalRevenue + booking.totalPrice
      }));
    });

    return () => socket.off("new-booking");
  }, []);

  // ================= MONTHLY ANALYTICS =================
  const monthlyRevenue = {};

  dashboardData.bookings.forEach((booking) => {
    const month = new Date(booking.createdAt).toLocaleString("default", {
      month: "short"
    });

    if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;

    if (booking.isPaid) {
      monthlyRevenue[month] += booking.totalPrice;
    }
  });

  const chartData = Object.keys(monthlyRevenue).map((month) => ({
    month,
    revenue: monthlyRevenue[month]
  }));

  return (
    <div className="p-6">

      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Monitor your bookings and revenue"
      />

      {loading ? (
        <p className="mt-8 text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          {/* ================= STATS ================= */}
          <div className="flex gap-4 my-8 flex-wrap">

            <div className="bg-blue-50 border border-blue-100 rounded-xl flex p-4 pr-8 shadow-sm">
              <img
                src={assets.totalBookingIcon}
                alt="booking"
                className="max-sm:hidden h-10"
              />

              <div className="flex flex-col sm:ml-4 font-medium">
                <p className="text-blue-600 text-lg">Total Bookings</p>
                <p className="text-gray-700 text-base">
                  {dashboardData.totalBookings}
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl flex p-4 pr-8 shadow-sm">
              <img
                src={assets.totalRevenueIcon}
                alt="revenue"
                className="max-sm:hidden h-10"
              />

              <div className="flex flex-col sm:ml-4 font-medium">
                <p className="text-green-600 text-lg">Total Revenue</p>
                <p className="text-gray-700 text-base">
                  {currency}{" "}
                  {Number(dashboardData.totalRevenue).toLocaleString()}
                </p>
              </div>
            </div>

          </div>

          {/* ================= REVENUE CHART ================= */}
          <div className="bg-white border rounded-xl p-5 shadow-sm mb-10">
            <h2 className="text-lg font-medium mb-4">
              Monthly Revenue
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ================= FILTER ================= */}
          <div className="flex gap-3 mb-4">

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-1 rounded ${
                statusFilter === "all"
                  ? "bg-black text-white"
                  : "border"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-4 py-1 rounded ${
                statusFilter === "paid"
                  ? "bg-green-600 text-white"
                  : "border"
              }`}
            >
              Paid
            </button>

            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-1 rounded ${
                statusFilter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "border"
              }`}
            >
              Pending
            </button>

          </div>

          {/* ================= BOOKINGS TABLE ================= */}
          <div className="w-full max-w-5xl border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Room</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-6 text-center text-gray-500"
                    >
                      No bookings
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t"
                    >
                      <td className="py-3 px-4">
                        {item.user?.username || "User"}
                      </td>

                      <td className="py-3 px-4">
                        {item.room?.roomType || "Room"}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {currency}{" "}
                        {Number(item.totalPrice).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">

                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            item.isPaid
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {item.isPaid ? "Paid" : "Pending"}
                        </span>

                      </td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;