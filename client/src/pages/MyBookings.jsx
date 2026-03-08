import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import BookingCalendar from "../components/BookingCalendar";

const MyBookings = () => {
  const { axios, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [view, setView] = useState("list"); // "list" | "calendar"

  // Image handler
  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  // Fetch bookings
  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.post("/api/bookings/user");
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message || "Failed to load bookings");
      }
    } catch {
      toast.error("Failed to load bookings");
    }
  };

  // Stripe payment
  const handlePayment = async (bookingId) => {
    try {
      setPayingId(bookingId);
      const { data } = await axios.post("/api/bookings/stripe-payment", { bookingId });
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Payment failed");
        setPayingId(null);
      }
    } catch {
      toast.error("Payment failed");
      setPayingId(null);
    }
  };

  // Cancel booking
  const handleCancel = async (bookingId) => {
    const result = await Swal.fire({
      title: "Cancel booking?",
      text: "You will lose this reservation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel booking",
    });
    if (!result.isConfirmed) return;
    try {
      setCancelingId(bookingId);
      const { data } = await axios.post(`/api/bookings/${bookingId}/cancel`);
      if (data.success) {
        toast.success("Booking cancelled successfully");
        fetchUserBookings();
      } else {
        toast.error(data.message || "Cancellation failed");
      }
    } catch {
      toast.error("Cancellation failed");
    } finally {
      setCancelingId(null);
    }
  };

  // Download invoice
  const downloadInvoice = async (bookingId) => {
    try {
      setDownloadingId(bookingId);
      const response = await axios.get(`/api/bookings/invoice/${bookingId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Invoice download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (user) fetchUserBookings();
  }, [user]);

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32">

      {/* Title + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <Title
          title="My Bookings"
          subTitle="Manage your hotel reservations easily."
          align="left"
        />
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start mt-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "calendar" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Calendar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mt-8 w-full text-gray-800">

        {bookings.length === 0 ? (
          <p className="py-10 text-gray-500">No bookings found.</p>
        ) : view === "calendar" ? (

          /* ── Calendar View ─────────────────────────────────── */
          <div className="max-w-2xl">
            <BookingCalendar bookings={bookings} isOwner={false} />
          </div>

        ) : (

          /* ── List View (your original UI) ──────────────────── */
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-6 border-b py-6"
            >
              {/* LEFT */}
              <div className="flex gap-4">
                <img
                  src={getImageUrl(booking.room?.images?.[0])}
                  alt="hotel"
                  className="w-28 h-24 rounded-lg object-cover"
                />
                <div>
                  <p className="font-playfair text-xl">
                    {booking.hotel?.name}
                    <span className="text-sm text-gray-500"> ({booking.room?.roomType})</span>
                  </p>
                  <p className="font-medium">
                    Total: ₹ {booking.totalPrice?.toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span className={
                      booking.status === "confirmed" ? "text-green-600" :
                      booking.status === "refunded" ? "text-red-600" : "text-yellow-600"
                    }>
                      {booking.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* DATES */}
              <div className="text-sm">
                <p>Check-In: {new Date(booking.checkInDate).toDateString()}</p>
                <p>Check-Out: {new Date(booking.checkOutDate).toDateString()}</p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 items-center">
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => handlePayment(booking._id)}
                      disabled={payingId === booking._id}
                      className="px-4 py-1.5 text-sm border rounded-full">
                      {payingId === booking._id ? "Redirecting..." : "Pay Now"}
                    </button>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelingId === booking._id}
                      className="px-4 py-1.5 text-sm border border-red-500 text-red-500 rounded-full">
                      {cancelingId === booking._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => downloadInvoice(booking._id)}
                      disabled={downloadingId === booking._id}
                      className="px-4 py-1.5 text-sm bg-black text-white rounded-full">
                      {downloadingId === booking._id ? "Downloading..." : "Invoice"}
                    </button>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelingId === booking._id}
                      className="px-4 py-1.5 text-sm border border-red-500 text-red-500 rounded-full">
                      {cancelingId === booking._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}
                {booking.status === "refunded" && (
                  <span className="text-sm text-red-500 font-medium">Refunded</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookings;
