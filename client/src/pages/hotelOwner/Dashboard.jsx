import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { currency, user, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch Dashboard Data (NO manual token handling)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data } = await axios.post("/api/bookings/hotel");

      if (data.success) {
        setDashboardData({
          bookings: data.dashboardData?.bookings || [],
          totalBookings: data.dashboardData?.totalBookings || 0,
          totalRevenue: data.dashboardData?.totalRevenue || 0,
        });
      } else {
        toast.error(data.message || "Failed to load dashboard");
      }
    } catch (error) {
      toast.error("Failed to load dashboard");
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="p-6">
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Monitor your listings, bookings, and revenue."
      />

      {loading ? (
        <div className="mt-10 text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* ================= STATS ================= */}
          <div className="flex gap-4 my-8 flex-wrap">

            {/* Total Bookings */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl flex p-4 pr-8 shadow-sm">
              <img
                src={assets.totalBookingIcon}
                alt="total-bookings"
                className="max-sm:hidden h-10"
              />

              <div className="flex flex-col sm:ml-4 font-medium">
                <p className="text-blue-600 text-lg">
                  Total Bookings
                </p>
                <p className="text-gray-700 text-base">
                  {dashboardData.totalBookings}
                </p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-green-50 border border-green-100 rounded-xl flex p-4 pr-8 shadow-sm">
              <img
                src={assets.totalRevenueIcon}
                alt="total-revenue"
                className="max-sm:hidden h-10"
              />

              <div className="flex flex-col sm:ml-4 font-medium">
                <p className="text-green-600 text-lg">
                  Total Revenue
                </p>
                <p className="text-gray-700 text-base">
                  {currency}{" "}
                  {Number(
                    dashboardData.totalRevenue
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ================= RECENT BOOKINGS ================= */}
          <h2 className="text-xl text-gray-800 font-medium mb-4">
            Recent Bookings
          </h2>

          <div className="w-full max-w-5xl border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-gray-700 font-medium text-left">
                    User
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-medium text-left">
                    Room
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-medium text-center">
                    Amount
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-medium text-center">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboardData.bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-6 text-center text-gray-500"
                    >
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  dashboardData.bookings.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-200"
                    >
                      <td className="py-3 px-4 text-gray-700">
                        {item.user?.username || "User"}
                      </td>

                      <td className="py-3 px-4 text-gray-700">
                        {item.room?.roomType || "Room"}
                      </td>

                      <td className="py-3 px-4 text-center text-gray-700">
                        {currency}{" "}
                        {Number(item.totalPrice).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            item.isPaid
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {item.isPaid
                            ? "Completed"
                            : "Pending"}
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