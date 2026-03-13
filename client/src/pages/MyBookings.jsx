import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import BookingCalendar from "../components/BookingCalendar";
import { FiCalendar, FiList, FiDownload, FiX, FiCreditCard, FiEdit2 } from "react-icons/fi";

// ── Status Timeline ───────────────────────────────────────────
const STEPS = ["pending", "confirmed", "completed"];

const StatusTimeline = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);

  if (status === "refunded" || status === "cancelled") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className={`text-xs font-medium px-3 py-1 rounded-full
          ${status === "refunded"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
          {status === "refunded" ? "💸 Refunded" : "❌ Cancelled"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((step, i) => {
        const done   = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] mt-1 capitalize
                ${active ? "text-gray-900 dark:text-white font-semibold" : "text-gray-400"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 transition-all
                ${i < currentIndex
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────────
const BookingSkeleton = () => (
  <div className="animate-pulse border-b border-gray-100 dark:border-gray-700 py-6">
    <div className="flex gap-4">
      <div className="w-28 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="flex gap-2 mt-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-3" />
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-3" />
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────
const EmptyBookings = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <FiCalendar className="text-3xl text-gray-400" />
    </div>
    <h3 className="text-xl font-playfair text-gray-800 dark:text-white mb-2">No Bookings Yet</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">
      You haven't made any reservations. Start exploring our hotels!
    </p>
    <button onClick={() => navigate("/rooms")}
      className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:opacity-80 transition">
      Browse Hotels
    </button>
  </div>
);

// ── ✅ Modify Booking Modal ───────────────────────────────────
const ModifyModal = ({ booking, onClose, onSuccess }) => {
  const { axios } = useAppContext();
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn]   = useState(new Date(booking.checkInDate).toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(new Date(booking.checkOutDate).toISOString().split("T")[0]);
  const [loading, setLoading]   = useState(false);

  const nights = checkIn && checkOut
    ? Math.max((new Date(checkOut) - new Date(checkIn)) / 86400000, 0)
    : 0;

  const pricePerNight   = booking.room?.pricePerNight || 0;
  const newSubtotal     = nights * pricePerNight;
  const newServiceFee   = newSubtotal * 0.1;
  const newTotal        = newSubtotal + newServiceFee;

  const handleSubmit = async () => {
    if (!checkIn || !checkOut) return toast.error("Please select both dates");
    if (checkIn >= checkOut) return toast.error("Check-out must be after check-in");
    if (checkIn === new Date(booking.checkInDate).toISOString().split("T")[0] &&
        checkOut === new Date(booking.checkOutDate).toISOString().split("T")[0]) {
      return toast.error("No changes made");
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/bookings/modify", {
        bookingId: booking._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });
      if (data.success) {
        toast.success("Booking updated! ✅");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Modification failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Modification failed");
    } finally {
      setLoading(false);
    }
  };

  // Close on Esc
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Modify Booking</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {booking.hotel?.name} — {booking.room?.roomType}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl transition">✕</button>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700 dark:text-amber-400">
          ⚠️ Only unpaid pending bookings can be modified. Price will be recalculated.
        </div>

        {/* Current dates */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 mb-5 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Current dates:</p>
          <p>
            {new Date(booking.checkInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" → "}
            {new Date(booking.checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* New dates */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">New Check In</label>
            <input type="date" min={today} value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">New Check Out</label>
            <input type="date" min={checkIn || today} value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white" />
          </div>
        </div>

        {/* New price preview */}
        {nights > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5 text-sm space-y-1.5">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">New Price Breakdown</p>
            <p className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>₹{pricePerNight} × {nights} night{nights > 1 ? "s" : ""}</span>
              <span>₹{newSubtotal.toFixed(0)}</span>
            </p>
            <p className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Service Fee (10%)</span>
              <span>₹{newServiceFee.toFixed(0)}</span>
            </p>
            <hr className="dark:border-gray-600" />
            <p className="flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>New Total</span>
              <span>₹{newTotal.toFixed(0)}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || nights === 0}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const MyBookings = () => {
  const { axios, user, navigate } = useAppContext();
  const [bookings, setBookings]       = useState([]);
  const [skelLoading, setSkelLoading] = useState(true);
  const [payingId, setPayingId]       = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [view, setView]               = useState("list");

  // ✅ Modify modal state
  const [modifyBooking, setModifyBooking] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  const fetchUserBookings = async () => {
    try {
      setSkelLoading(true);
      const { data } = await axios.get("/api/bookings/user");
      if (data.success) setBookings(data.bookings || []);
      else toast.error(data.message || "Failed to load bookings");
    } catch { toast.error("Failed to load bookings"); }
    finally { setSkelLoading(false); }
  };

  const handlePayment = async (bookingId) => {
    try {
      setPayingId(bookingId);
      const { data } = await axios.post("/api/bookings/stripe-payment", { bookingId });
      if (data.success) window.location.href = data.url;
      else { toast.error(data.message || "Payment failed"); setPayingId(null); }
    } catch { toast.error("Payment failed"); setPayingId(null); }
  };

  const handleCancel = async (bookingId) => {
    const result = await Swal.fire({
      title: "Cancel booking?",
      text: "You will lose this reservation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel",
    });
    if (!result.isConfirmed) return;
    try {
      setCancelingId(bookingId);
      const { data } = await axios.post(`/api/bookings/cancel/${bookingId}`);
      if (data.success) { toast.success("Booking cancelled"); fetchUserBookings(); }
      else toast.error(data.message || "Cancellation failed");
    } catch { toast.error("Cancellation failed"); }
    finally { setCancelingId(null); }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      setDownloadingId(bookingId);
      const response = await axios.get(`/api/bookings/invoice/${bookingId}`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { toast.error("Invoice download failed"); }
    finally { setDownloadingId(null); }
  };

  useEffect(() => { if (user) fetchUserBookings(); }, [user]);

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 dark:bg-gray-900 min-h-screen transition-colors duration-300">

      {/* ✅ Modify Modal */}
      {modifyBooking && (
        <ModifyModal
          booking={modifyBooking}
          onClose={() => setModifyBooking(null)}
          onSuccess={fetchUserBookings}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <Title title="My Bookings" subTitle="Manage your hotel reservations easily." align="left" />

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start">
          {[
            { key: "list",     icon: <FiList />,     label: "List" },
            { key: "calendar", icon: <FiCalendar />, label: "Calendar" },
          ].map(({ key, icon, label }) => (
            <button key={key} onClick={() => setView(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${view === key
                  ? "bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mt-8 w-full">

        {/* Skeleton */}
        {skelLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <BookingSkeleton key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!skelLoading && bookings.length === 0 && <EmptyBookings navigate={navigate} />}

        {/* Calendar */}
        {!skelLoading && bookings.length > 0 && view === "calendar" && (
          <div className="max-w-2xl">
            <BookingCalendar bookings={bookings} isOwner={false} />
          </div>
        )}

        {/* List */}
        {!skelLoading && bookings.length > 0 && view === "list" && bookings.map((booking) => (
          <div key={booking._id}
            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-6 border-b border-gray-100 dark:border-gray-700 py-6">

            {/* LEFT */}
            <div className="flex gap-4">
              <img src={getImageUrl(booking.room?.images?.[0])} alt="hotel"
                className="w-28 h-24 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <p className="font-playfair text-xl text-gray-900 dark:text-white">
                  {booking.hotel?.name}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-sans">
                    {" "}({booking.room?.roomType})
                  </span>
                </p>
                <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                  ₹{booking.totalPrice?.toLocaleString()}
                </p>
                {booking.couponCode && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    🎟 Coupon: {booking.couponCode}
                  </p>
                )}
                <StatusTimeline status={booking.status} />
              </div>
            </div>

            {/* DATES */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="flex items-center gap-2">
                <FiCalendar className="shrink-0" />
                Check-In: <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(booking.checkInDate).toDateString()}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <FiCalendar className="shrink-0" />
                Check-Out: <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(booking.checkOutDate).toDateString()}
                </span>
              </p>
              <p className="text-xs mt-2">
                {booking.isPaid
                  ? <span className="text-green-600 dark:text-green-400 font-medium">✓ Paid</span>
                  : <span className="text-yellow-600 dark:text-yellow-400">⏳ Unpaid</span>}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-row md:flex-col gap-2 items-start md:items-end justify-start md:justify-center">
              {booking.status === "pending" && !booking.isPaid && (
                <>
                  <button onClick={() => handlePayment(booking._id)} disabled={payingId === booking._id}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition disabled:opacity-60">
                    <FiCreditCard className="text-xs" />
                    {payingId === booking._id ? "Redirecting..." : "Pay Now"}
                  </button>

                  {/* ✅ MODIFY BUTTON — only for pending + unpaid */}
                  <button onClick={() => setModifyBooking(booking)}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-blue-400 text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                    <FiEdit2 className="text-xs" />
                    Modify
                  </button>

                  <button onClick={() => handleCancel(booking._id)} disabled={cancelingId === booking._id}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-red-400 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-60">
                    <FiX className="text-xs" />
                    {cancelingId === booking._id ? "Cancelling..." : "Cancel"}
                  </button>
                </>
              )}
              {booking.status === "confirmed" && (
                <>
                  <button onClick={() => downloadInvoice(booking._id)} disabled={downloadingId === booking._id}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition disabled:opacity-60">
                    <FiDownload className="text-xs" />
                    {downloadingId === booking._id ? "Downloading..." : "Invoice"}
                  </button>
                  <button onClick={() => handleCancel(booking._id)} disabled={cancelingId === booking._id}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-red-400 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-60">
                    <FiX className="text-xs" />
                    {cancelingId === booking._id ? "Cancelling..." : "Cancel"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;