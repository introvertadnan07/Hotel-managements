import { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import BookingCalendar from "../../components/BookingCalendar";
import toast from "react-hot-toast";

const BookingsCalendar = () => {
  const { axios, user } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/bookings/hotel");
      if (data.success) {
        setBookings(data.dashboardData?.bookings || []);
      }
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const now = new Date();
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.checkInDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const checkinToday = bookings.filter(b =>
    new Date(b.checkInDate).toDateString() === now.toDateString()
  );
  const checkoutToday = bookings.filter(b =>
    new Date(b.checkOutDate).toDateString() === now.toDateString()
  );

  return (
    <div className="p-6">
      <Title align="left" font="outfit" title="Bookings Calendar" subTitle="Visual overview of all guest stays" />

      {loading ? (
        <p className="mt-8 text-gray-500">Loading calendar...</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 my-8">

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <p className="text-blue-600 text-sm font-medium">This Month</p>
                <p className="text-gray-800 text-xl font-bold">{thisMonth.length} bookings</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <div>
                <p className="text-emerald-600 text-sm font-medium">Check-ins Today</p>
                <p className="text-gray-800 text-xl font-bold">{checkinToday.length}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <p className="text-amber-600 text-sm font-medium">Check-outs Today</p>
                <p className="text-gray-800 text-xl font-bold">{checkoutToday.length}</p>
              </div>
            </div>

          </div>

          <div className="max-w-2xl">
            <BookingCalendar bookings={bookings} isOwner={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default BookingsCalendar;
