import { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from "recharts";

// ── Room type colors ──────────────────────────────────────────────────────
const ROOM_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

// ── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-600">
            {p.name === "revenue"
              ? `Revenue: ${currency}${Number(p.value).toLocaleString()}`
              : `Bookings: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { axios, currency, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("revenue");

  // ── Fetch bookings ────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/bookings/hotel");
      if (data.success) {
        setBookings(data.dashboardData?.bookings || []);
      }
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);


  // ── Derived stats ─────────────────────────────────────────────────────
  const totalBookings = bookings.length;
  const paidCount = bookings.filter(b => b.isPaid).length;
  const pendingCount = bookings.filter(b => !b.isPaid).length;
  const totalRevenue = bookings.filter(b => b.isPaid).reduce((s, b) => s + b.totalPrice, 0);
  const occupancyRate = totalBookings > 0 ? ((paidCount / totalBookings) * 100).toFixed(1) : 0;
  const avgBookingValue = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

  // ── Monthly chart data ────────────────────────────────────────────────
  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyMap = {};
  bookings.forEach((b) => {
    const m = new Date(b.createdAt).toLocaleString("default", { month: "short" });
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, revenue: 0, bookings: 0 };
    monthlyMap[m].bookings += 1;
    if (b.isPaid) monthlyMap[m].revenue += b.totalPrice;
  });
  const chartData = monthOrder.filter(m => monthlyMap[m]).map(m => monthlyMap[m]);

  // ── Room type breakdown ───────────────────────────────────────────────
  const roomTypeMap = {};
  bookings.forEach((b) => {
    const type = b.room?.roomType || "Unknown";
    roomTypeMap[type] = (roomTypeMap[type] || 0) + 1;
  });
  const roomTypeData = Object.entries(roomTypeMap).map(([name, value]) => ({ name, value }));

  // ── Top rooms by revenue ──────────────────────────────────────────────
  const roomRevMap = {};
  bookings.forEach((b) => {
    if (!b.isPaid) return;
    const key = b.room?.roomType || "Unknown";
    roomRevMap[key] = (roomRevMap[key] || 0) + b.totalPrice;
  });
  const topRooms = Object.entries(roomRevMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, revenue]) => ({ type, revenue }));

  // ── Stat cards ────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings,
      sub: `${paidCount} paid · ${pendingCount} pending`,
      bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600",
      icon: (
        <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: `${currency}${Number(totalRevenue).toLocaleString()}`,
      sub: `Avg ${currency}${Number(avgBookingValue).toLocaleString()} / booking`,
      bg: "bg-green-50", border: "border-green-100", text: "text-green-600",
      icon: (
        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      sub: `${paidCount} confirmed stays`,
      bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600",
      icon: (
        <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline strokeLinecap="round" points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "Room Types",
      value: roomTypeData.length,
      sub: "Active categories",
      bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600",
      icon: (
        <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6">

      <Title
        align="left"
        font="outfit"
        title="Analytics"
        subTitle="Deep insights into your hotel performance"
      />

      {loading ? (
        <p className="mt-8 text-gray-500">Loading analytics...</p>
      ) : (
        <>
          {/* ── Stat Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-8">
            {stats.map((s, i) => (
              <div key={i} className={`${s.bg} ${s.border} border rounded-xl p-5 shadow-sm flex gap-4 items-start`}>
                <div className="p-2 rounded-lg bg-white shadow-sm flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className={`${s.text} text-sm font-medium`}>{s.label}</p>
                  <p className="text-gray-800 text-xl font-bold leading-tight">{s.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Area Chart — Monthly Performance ───────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Monthly Performance</h2>
                <p className="text-gray-400 text-xs mt-0.5">Revenue and bookings trend over time</p>
              </div>
              <div className="flex gap-2">
                {["revenue", "bookings"].map((t) => (
                  <button key={t} onClick={() => setActiveChart(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeChart === t
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length === 0 ? (
              <p className="text-gray-400 text-sm py-16 text-center">No booking data available yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeChart === "revenue" ? "#10b981" : "#3b82f6"} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={activeChart === "revenue" ? "#10b981" : "#3b82f6"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Area
                    type="monotone"
                    dataKey={activeChart}
                    stroke={activeChart === "revenue" ? "#10b981" : "#3b82f6"}
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={{ r: 4, strokeWidth: 0, fill: activeChart === "revenue" ? "#10b981" : "#3b82f6" }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Bottom Row ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Bar chart — revenue by room type */}
            <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-1">Revenue by Room Type</h2>
              <p className="text-gray-400 text-xs mb-5">Top earning room categories</p>
              {topRooms.length === 0 ? (
                <p className="text-gray-400 text-sm py-16 text-center">No paid bookings yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topRooms} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip currency={currency} />} />
                    <Bar dataKey="revenue" name="revenue" radius={[6, 6, 0, 0]}>
                      {topRooms.map((_, i) => (
                        <Cell key={i} fill={ROOM_COLORS[i % ROOM_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie — room type booking share */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-1">Room Type Breakdown</h2>
              <p className="text-gray-400 text-xs mb-4">Booking share by room type</p>
              {roomTypeData.length === 0 ? (
                <p className="text-gray-400 text-sm py-16 text-center">No data yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={roomTypeData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {roomTypeData.map((_, i) => (
                          <Cell key={i} fill={ROOM_COLORS[i % ROOM_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [`${v} bookings`, n]}
                        contentStyle={{
                          borderRadius: "10px", fontSize: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3">
                    {roomTypeData.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: ROOM_COLORS[i % ROOM_COLORS.length] }} />
                        <span className="text-gray-500 text-xs truncate">{r.name}</span>
                        <span className="text-gray-700 text-xs font-semibold ml-auto">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
