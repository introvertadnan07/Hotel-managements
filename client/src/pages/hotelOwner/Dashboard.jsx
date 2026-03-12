import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const Dashboard = () => {
  const { currency, user, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [], totalBookings: 0, totalRevenue: 0
  });
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: POST → GET
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/bookings/hotel");
      if (data.success) {
        const bookings = data.dashboardData?.bookings || [];
        setDashboardData({
          bookings,
          totalBookings: data.dashboardData?.totalBookings || 0,
          totalRevenue: data.dashboardData?.totalRevenue || 0,
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

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(dashboardData.bookings);
    } else {
      setFilteredBookings(
        dashboardData.bookings.filter(b =>
          statusFilter === "paid" ? b.isPaid : !b.isPaid
        )
      );
    }
  }, [statusFilter, dashboardData.bookings]);

  // Monthly chart data
  const monthlyRevenue = {};
  dashboardData.bookings.forEach((booking) => {
    const month = new Date(booking.createdAt).toLocaleString("default", { month: "short" });
    if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
    if (booking.isPaid) monthlyRevenue[month] += booking.totalPrice;
  });
  const chartData = Object.keys(monthlyRevenue).map(month => ({
    month, revenue: monthlyRevenue[month]
  }));

  return (
    <div className="p-6">
      <Title align="left" font="outfit" title="Dashboard" subTitle="Monitor your bookings and revenue" />

      {loading ? (
        // ── Skeleton ────────────────────────────────────
        <div className="animate-pulse mt-8 space-y-6">
          <div className="flex gap-4 flex-wrap">
            <div className="h-20 w-52 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-20 w-52 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      ) : (
        <>
          {/* ── Stats ─────────────────────────────────── */}
          <div className="flex gap-4 my-8 flex-wrap">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex p-4 pr-8 shadow-sm">
              <img src={assets.totalBookingIcon} alt="booking" className="max-sm:hidden h-10 dark:invert dark:opacity-70" />
              <div className="flex flex-col sm:ml-4 font-medium">
                <p className="text-blue-600 dark:text-blue-400 text-lg">Total Bookings</p>
                <p className="text-gray-700 dark:text-gray-300 text-base">{dashboardData.totalBookings}</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl flex p-4 pr-8 shadow-sm">
              <img src={assets.totalRevenueIcon} alt="revenue" className="max-sm:hidden h-10 dark:invert dark:opacity-70" />
              <div className="flex flex-col sm:ml-4 font-medium">
                <p className="text-green-600 dark:text-green-400 text-lg">Total Revenue</p>
                <p className="text-gray-700 dark:text-gray-300 text-base">
                  {currency} {Number(dashboardData.totalRevenue).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ── Chart ─────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm mb-10 transition-colors duration-300">
            <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Monthly Revenue</h2>
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                No revenue data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--tooltip-bg, #fff)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    formatter={(val) => [`₹${val.toLocaleString()}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Filter ────────────────────────────────── */}
          <div className="flex gap-3 mb-4">
            {[
              { key: "all",     label: "All",     active: "bg-black dark:bg-white text-white dark:text-black" },
              { key: "paid",    label: "Paid",    active: "bg-green-600 text-white" },
              { key: "pending", label: "Pending", active: "bg-yellow-500 text-white" },
            ].map(({ key, label, active }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
                  ${statusFilter === key
                    ? active
                    : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Bookings Table ────────────────────────── */}
          <div className="w-full max-w-5xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800 transition-colors duration-300">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {["User", "Room", "Amount", "Status"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-400 dark:text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                        {item.user?.username || "User"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {item.room?.roomType || "Room"}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                        {currency} {Number(item.totalPrice).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          item.isPaid
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
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