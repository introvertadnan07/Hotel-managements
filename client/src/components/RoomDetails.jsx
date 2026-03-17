import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { FaUserFriends, FaBed, FaBath, FaStar, FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaCalendarAlt, FaShare, FaCopy, FaWhatsapp, FaReply } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { addRecentlyViewed } from "./RecentlyViewed";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose, getImageUrl }) => {
  const [current, setCurrent] = useState(startIndex);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition z-10">
        <FaTimes className="text-xl" />
      </button>
      <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">{current + 1} / {images.length}</p>
      <div className="relative flex items-center justify-center w-full h-full px-16 py-16" onClick={(e) => e.stopPropagation()}>
        <img src={getImageUrl(images[current])} alt={`Room image ${current + 1}`} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none" draggable={false} />
        {images.length > 1 && (
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition">
            <FaChevronLeft className="text-xl" />
          </button>
        )}
        {images.length > 1 && (
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition">
            <FaChevronRight className="text-xl" />
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-full pb-1" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${i === current ? "border-white" : "border-transparent opacity-50 hover:opacity-80"}`}>
              <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SHARE MODAL ─────────────────────────────────────────────────────────────
const ShareModal = ({ room, onClose }) => {
  const url  = window.location.href;
  const text = `Check out ${room?.hotel?.name} - ${room?.roomType} on AnumiflyStay! 🏨`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied! 🔗");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaShare className="text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Share this room</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg transition">✕</button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 shrink-0 overflow-hidden">
            {room?.images?.[0] && (
              <img src={typeof room.images[0] === "string" && room.images[0].startsWith("http") ? room.images[0] : `${import.meta.env.VITE_API_URL}/${room.images[0]}`} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{room?.hotel?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{room?.roomType} · {room?.hotel?.city}</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <input readOnly value={url} className="flex-1 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 outline-none truncate" />
          <button onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition shrink-0 ${copied ? "bg-green-500 text-white" : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"}`}>
            <FaCopy className="text-xs" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank")}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium transition">
            <FaWhatsapp className="text-base" /> WhatsApp
          </button>
          {navigator.share ? (
            <button onClick={() => navigator.share({ title: room?.hotel?.name, text, url })}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium transition">
              <FaShare className="text-sm" /> More
            </button>
          ) : (
            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl text-sm font-medium transition">
              𝕏 Twitter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── AVAILABILITY CALENDAR ────────────────────────────────────────────────────
const AvailabilityCalendar = ({ bookedRanges, checkInDate, checkOutDate, onSelectDates }) => {
  const todayRaw = new Date(); todayRaw.setHours(0, 0, 0, 0);
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [hoverDate, setHoverDate]                 = useState(null);
  const [selectingCheckout, setSelectingCheckout] = useState(false);

  const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const bookedDates = useMemo(() => {
    const set = new Set();
    bookedRanges.forEach(({ checkIn, checkOut }) => {
      const start = new Date(checkIn);  start.setHours(0,0,0,0);
      const end   = new Date(checkOut); end.setHours(0,0,0,0);
      const cur   = new Date(start);
      while (cur < end) { set.add(cur.toDateString()); cur.setDate(cur.getDate() + 1); }
    });
    return set;
  }, [bookedRanges]);

  const isBooked = (d) => bookedDates.has(d.toDateString());
  const isPast   = (d) => d < todayRaw;

  const isInRange = (date) => {
    const ci = checkInDate  ? new Date(checkInDate)  : null;
    const co = checkOutDate ? new Date(checkOutDate) : null;
    if (ci && !co && hoverDate && selectingCheckout) {
      const [s, e] = ci < hoverDate ? [ci, hoverDate] : [hoverDate, ci];
      return date > s && date < e;
    }
    if (ci && co) return date > ci && date < co;
    return false;
  };

  const isCI = (d) => checkInDate  && d.toDateString() === new Date(checkInDate).toDateString();
  const isCO = (d) => checkOutDate && d.toDateString() === new Date(checkOutDate).toDateString();

  const handleDayClick = (date) => {
    if (isPast(date) || isBooked(date)) return;
    if (!checkInDate || (checkInDate && checkOutDate)) { onSelectDates(date.toISOString().split("T")[0], ""); setSelectingCheckout(true); return; }
    const ci = new Date(checkInDate);
    if (date <= ci) { onSelectDates(date.toISOString().split("T")[0], ""); setSelectingCheckout(true); return; }
    const cur = new Date(ci); cur.setDate(cur.getDate() + 1);
    while (cur < date) { if (isBooked(cur)) { toast.error("Selected range includes booked dates"); return; } cur.setDate(cur.getDate() + 1); }
    onSelectDates(checkInDate, date.toISOString().split("T")[0]);
    setSelectingCheckout(false);
  };

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const first = new Date(year, month, 1).getDay(), total = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><FaCalendarAlt className="text-gray-500 dark:text-gray-400" /><h2 className="text-lg font-playfair dark:text-white">Availability</h2></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-400"><FaChevronLeft className="text-sm" /></button>
          <span className="text-sm font-medium dark:text-white min-w-[130px] text-center">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-400"><FaChevronRight className="text-sm" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">{DAYS.map((d) => <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-y-1">
        {getDaysInMonth().map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const booked = isBooked(date), past = isPast(date), inRange = isInRange(date), ci = isCI(date), co = isCO(date), isToday = date.toDateString() === todayRaw.toDateString(), disabled = booked || past;
          return (
            <div key={date.toDateString()} onClick={() => handleDayClick(date)}
              onMouseEnter={() => { if (selectingCheckout && checkInDate && !checkOutDate) setHoverDate(date); }}
              onMouseLeave={() => setHoverDate(null)}
              className={`relative text-center py-1.5 text-sm rounded-lg transition select-none
                ${disabled ? "text-gray-300 dark:text-gray-600 cursor-not-allowed line-through" : "cursor-pointer"}
                ${booked ? "bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500" : ""}
                ${inRange && !disabled ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-none" : ""}
                ${ci ? "!bg-black dark:!bg-white !text-white dark:!text-black rounded-lg font-bold" : ""}
                ${co ? "!bg-black dark:!bg-white !text-white dark:!text-black rounded-lg font-bold" : ""}
                ${!disabled && !inRange && !ci && !co ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" : ""}`}>
              {date.getDate()}
              {isToday && !ci && !co && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {[{ color: "bg-black dark:bg-white", label: "Selected" }, { color: "bg-blue-100 dark:bg-blue-900/40", label: "Your stay" }, { color: "bg-red-100 dark:bg-red-900/30", label: "Booked" }, { color: "bg-gray-100 dark:bg-gray-700", label: "Available" }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><div className={`w-3 h-3 rounded ${color}`} /><span>{label}</span></div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        {!checkInDate ? "Click a date to set check-in" : !checkOutDate ? "Now click a date to set check-out"
          : `${new Date(checkInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → ${new Date(checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
      </p>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { axios, currency, navigate, user, isOwner } = useAppContext();

  const [room, setRoom]         = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [loading, setLoading]   = useState(false);

  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareOpen, setShareOpen]         = useState(false);

  const [checkInDate, setCheckInDate]   = useState(searchParams.get("checkIn")  || "");
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests]             = useState(Number(searchParams.get("guests")) || 1);

  const [bookedRanges, setBookedRanges] = useState([]);
  const [mapCoords, setMapCoords]       = useState(null);
  const [mapLoading, setMapLoading]     = useState(false);

  const [couponCode, setCouponCode]       = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [reviews, setReviews]             = useState([]);
  const [canReview, setCanReview]         = useState(false);
  const [reviewRating, setReviewRating]   = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoverRating, setHoverRating]     = useState(0);

  // ✅ Owner reply state
  const [replyingTo, setReplyingTo]     = useState(null); // reviewId
  const [replyText, setReplyText]       = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const getImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (typeof img === "string" && img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  const images = room?.images || [];
  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success) {
        setRoom(data.room);
        setMainImage(0);
        addRecentlyViewed(data.room);
      }
    } catch (error) {
      console.error("Failed to load room:", error);
      toast.error("Failed to load room");
    }
  };

  const fetchBookedRanges = async () => {
    try {
      const { data } = await axios.get(`/api/bookings/booked-dates/${id}`);
      if (data.success) setBookedRanges(data.bookedRanges);
    } catch {}
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      if (data.success) setReviews(data.reviews);
    } catch {}
  };

  const checkCanReview = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`/api/reviews/can-review/${id}`);
      if (data.success) setCanReview(data.canReview);
    } catch {}
  };

  useEffect(() => { fetchRoom(); fetchReviews(); fetchBookedRanges(); }, [id]);
  useEffect(() => { checkCanReview(); }, [id, user]);

  useEffect(() => {
    if (!room?.hotel?.address) return;
    const geocode = async () => {
      try {
        setMapLoading(true);
        const query = encodeURIComponent(room.hotel.address);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
        const results = await res.json();
        if (results.length > 0) setMapCoords({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
      } catch {} finally { setMapLoading(false); }
    };
    geocode();
  }, [room]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    if (!checkInDate || !checkOutDate) return toast.error("Please select dates first");
    try {
      setCouponLoading(true);
      const { data } = await axios.post("/api/bookings/validate-coupon", { code: couponCode, total });
      if (data.success) { setCouponApplied(data); toast.success(data.message); }
      else { toast.error(data.message); setCouponApplied(null); }
    } catch (err) { toast.error(err?.response?.data?.message || "Invalid coupon"); setCouponApplied(null); }
    finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponApplied(null); setCouponCode(""); };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return toast.error("Please write a comment");
    try {
      setReviewLoading(true);
      const { data } = await axios.post("/api/reviews", { roomId: id, rating: reviewRating, comment: reviewComment });
      if (data.success) { toast.success("Review submitted! ⭐"); setReviewComment(""); setReviewRating(5); setCanReview(false); fetchReviews(); }
      else toast.error(data.message || "Failed to submit review");
    } catch { toast.error("Failed to submit review"); }
    finally { setReviewLoading(false); }
  };

  // ✅ Owner reply submit
  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    try {
      setReplyLoading(true);
      const { data } = await axios.post(`/api/reviews/${reviewId}/reply`, { reply: replyText });
      if (data.success) { toast.success("Reply posted! ✅"); setReplyingTo(null); setReplyText(""); fetchReviews(); }
      else toast.error(data.message || "Failed to post reply");
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to post reply"); }
    finally { setReplyLoading(false); }
  };

  // ✅ Delete owner reply
  const handleDeleteReply = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/reviews/${reviewId}/reply`);
      if (data.success) { toast.success("Reply deleted"); fetchReviews(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to delete reply"); }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login required");
    if (!checkInDate || !checkOutDate) return toast.error("Select dates");
    if (guests > room.maxGuests) return toast.error(`Maximum ${room.maxGuests} guests allowed`);
    try {
      setLoading(true);
      const availabilityRes = await axios.post("/api/bookings/check-availability", { roomId: id, checkInDate, checkOutDate });
      if (!availabilityRes.data.isAvailable) { toast.error("Room not available for selected dates"); return; }
      const { data } = await axios.post("/api/bookings/book", { roomId: id, checkInDate, checkOutDate, guests: Number(guests), couponCode: couponApplied ? couponCode : undefined });
      if (data.success) { toast.success("Booking confirmed! Check your email 📧"); navigate("/my-bookings"); }
      else toast.error(data.message || "Booking failed");
    } catch { toast.error("Booking failed"); }
    finally { setLoading(false); }
  };

  if (!room) return <p className="pt-32 text-center dark:text-white">Loading...</p>;

  const nights          = checkInDate && checkOutDate ? Math.max((new Date(checkOutDate) - new Date(checkInDate)) / 86400000, 0) : 0;
  const baseGuests      = room.baseGuests      || 2;
  const extraGuestPrice = room.extraGuestPrice || 500;
  let subtotal          = nights * room.pricePerNight;
  if (guests > baseGuests) subtotal += (guests - baseGuests) * extraGuestPrice * nights;
  const serviceFee = subtotal * 0.1;
  const total      = subtotal + serviceFee;
  const discount   = couponApplied ? couponApplied.discount : 0;
  const finalTotal = Math.max(total - discount, 0);
  const avgRating  = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24 xl:px-32 dark:bg-gray-900 min-h-screen transition-colors duration-300">

      {lightboxOpen && <Lightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} getImageUrl={getImageUrl} />}
      {shareOpen && <ShareModal room={room} onClose={() => setShareOpen(false)} />}

      {/* Title + Share */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-playfair dark:text-white">{room.hotel?.name} ({room.roomType})</h1>
        <button onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0">
          <FaShare className="text-sm" /> Share
        </button>
      </div>

      <div className="flex flex-wrap gap-6 mt-4 text-gray-600 dark:text-gray-400 items-center">
        <div className="flex items-center gap-2"><FaUserFriends /><span>{room.maxGuests} Guests</span></div>
        <div className="flex items-center gap-2"><FaBed /><span>{room.beds || 1} Beds</span></div>
        <div className="flex items-center gap-2"><FaBath /><span>{room.bathrooms || 1} Bath</span></div>
        {avgRating && (
          <div className="flex items-center gap-1 text-yellow-500">
            <FaStar />
            <span className="font-medium text-gray-700 dark:text-gray-300">{avgRating}</span>
            <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <hr className="my-6 dark:border-gray-700" />

      <div className="flex flex-col lg:flex-row gap-12">

        {/* LEFT */}
        <div className="flex-1">

          {/* Main image */}
          <div className="relative group cursor-pointer" onClick={() => openLightbox(mainImage)}>
            <img src={getImageUrl(images[mainImage])} className="w-full h-[420px] object-cover rounded-2xl shadow transition-opacity group-hover:opacity-90" alt="room" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-2xl">
              <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm"><FaExpand /><span>View Gallery</span></div>
            </div>
            {images.length > 1 && <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">1 / {images.length}</div>}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={getImageUrl(img)} onClick={() => setMainImage(index)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${mainImage === index ? "border-black dark:border-white" : "border-gray-200 dark:border-gray-700 hover:border-gray-400"}`}
                    alt="thumbnail" />
                  <button onClick={() => openLightbox(index)} className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 rounded-lg transition opacity-0 group-hover:opacity-100">
                    <FaExpand className="text-white text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Availability Calendar */}
          <AvailabilityCalendar
            bookedRanges={bookedRanges}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onSelectDates={(ci, co) => { setCheckInDate(ci); setCheckOutDate(co); setCouponApplied(null); }}
          />

          {/* Map */}
          <div className="mt-10">
            <h2 className="text-xl font-playfair mb-1 dark:text-white">Hotel Location</h2>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <img src={assets.locationIcon} alt="" className="w-4 h-4 dark:invert" />
              {room.hotel?.address}
            </p>
            {mapLoading && <div className="w-full h-[300px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">Loading map...</div>}
            {!mapLoading && mapCoords && (
              <div className="rounded-2xl overflow-hidden shadow h-[300px]">
                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[mapCoords.lat, mapCoords.lng]}>
                    <Popup><strong>{room.hotel?.name}</strong><br />{room.hotel?.address}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
            {!mapLoading && !mapCoords && <div className="w-full h-[300px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">Map not available</div>}
          </div>

          {/* REVIEWS */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-playfair dark:text-white">Guest Reviews</h2>
              {avgRating && (
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="font-semibold text-sm dark:text-yellow-300">{avgRating}</span>
                  <span className="text-gray-400 text-xs">/ 5</span>
                </div>
              )}
            </div>

            {user && canReview && (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8">
                <h3 className="font-medium mb-1 dark:text-white">Write a Review</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mb-4">✅ You stayed here — share your experience!</p>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                      <FaStar className={`text-2xl transition ${star <= (hoverRating || reviewRating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 self-center">{["","Poor","Fair","Good","Very Good","Excellent"][hoverRating || reviewRating]}</span>
                </div>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={3}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white resize-none" required />
                <button type="submit" disabled={reviewLoading}
                  className="mt-3 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm hover:opacity-80 transition disabled:opacity-60">
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {!user && (
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl">
                <span>🔒</span><span>Please login and complete a stay to leave a review.</span>
              </div>
            )}
            {user && !canReview && (
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl">
                <span>🏨</span><span>Reviews are available only after your stay is completed.</span>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to review after your stay!</p>
            ) : (
              <div className="flex flex-col gap-6">
                {reviews.map((review) => (
                  <div key={review._id} className="flex flex-col gap-3">
                    {/* Guest review */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {review.user?.image
                          ? <img src={review.user.image} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{review.user?.username?.[0]?.toUpperCase() || "U"}</span>
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-medium text-sm dark:text-white">{review.user?.username || "Guest"}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            {/* ✅ Owner reply button */}
                            {isOwner && !review.ownerReply && (
                              <button onClick={() => { setReplyingTo(review._id); setReplyText(""); }}
                                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition">
                                <FaReply className="text-xs" /> Reply
                              </button>
                            )}
                            {isOwner && review.ownerReply && (
                              <button onClick={() => handleDeleteReply(review._id)}
                                className="text-xs text-red-400 hover:text-red-600 transition">
                                Delete reply
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map((star) => (
                            <FaStar key={star} className={`text-xs ${star <= review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-600"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{review.comment}</p>
                      </div>
                    </div>

                    {/* ✅ Owner reply inline form */}
                    {replyingTo === review._id && (
                      <div className="ml-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">🏨 Reply as Hotel Owner</p>
                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..." rows={2}
                          className="w-full border border-blue-200 dark:border-blue-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleReplySubmit(review._id)} disabled={replyLoading}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-60">
                            {replyLoading ? "Posting..." : "Post Reply"}
                          </button>
                          <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-400 hover:text-gray-600 transition px-2">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* ✅ Show existing owner reply */}
                    {review.ownerReply && (
                      <div className="ml-14 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                          🏨 <span>Hotel Response</span>
                          {review.ownerRepliedAt && (
                            <span className="text-gray-400 font-normal">· {new Date(review.ownerRepliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOOKING CARD */}
        <div className="lg:w-[360px]">
          <div className="sticky top-28 border dark:border-gray-700 rounded-2xl shadow-lg p-5 space-y-4 dark:bg-gray-800">
            <p className="text-2xl font-semibold dark:text-white">
              {currency} {room.pricePerNight}
              <span className="text-sm text-gray-500 dark:text-gray-400"> / night</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Max {room.maxGuests} guests allowed</p>

            {(checkInDate || checkOutDate) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                <span>
                  📅 {checkInDate ? new Date(checkInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Check-in"}
                  {" → "}
                  {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Check-out"}
                </span>
                <button onClick={() => { setCheckInDate(""); setCheckOutDate(""); setCouponApplied(null); }} className="ml-2 text-blue-400 hover:text-red-500 transition">✕</button>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Check In</label>
                <input type="date" min={today} value={checkInDate}
                  onChange={(e) => { setCheckInDate(e.target.value); setCouponApplied(null); if (checkOutDate && e.target.value >= checkOutDate) setCheckOutDate(""); }}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-black dark:focus:border-white" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Check Out</label>
                <input type="date" min={checkInDate || today} value={checkOutDate}
                  onChange={(e) => { setCheckOutDate(e.target.value); setCouponApplied(null); }}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-black dark:focus:border-white" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Guests</label>
                <input type="number" min="1" max={room.maxGuests} value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-black dark:focus:border-white" />
              </div>

              {nights > 0 && (
                <div>
                  {!couponApplied ? (
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo code"
                        className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-black uppercase" />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading}
                        className="bg-gray-100 dark:bg-gray-600 dark:text-white hover:bg-gray-200 text-sm px-4 py-2 rounded-lg transition disabled:opacity-60">
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-sm">✅</span>
                        <span className="text-green-700 dark:text-green-400 text-sm font-medium">{couponCode}</span>
                        <span className="text-green-600 dark:text-green-500 text-xs">{couponApplied.message}</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  )}
                </div>
              )}

              {nights > 0 && (
                <div className="text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg space-y-1">
                  <p className="flex justify-between dark:text-gray-300">
                    <span>{currency}{room.pricePerNight} × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>{currency} {subtotal.toFixed(0)}</span>
                  </p>
                  <p className="flex justify-between dark:text-gray-300"><span>Service Fee (10%)</span><span>{currency} {serviceFee.toFixed(0)}</span></p>
                  {couponApplied && (
                    <p className="flex justify-between text-green-600 dark:text-green-400"><span>Discount</span><span>- {currency} {discount.toFixed(0)}</span></p>
                  )}
                  <hr className="my-1 dark:border-gray-600" />
                  <p className="flex justify-between font-semibold text-base dark:text-white"><span>Total</span><span>{currency} {finalTotal.toFixed(0)}</span></p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg hover:opacity-80 transition disabled:opacity-60 font-medium">
                {loading ? "Processing..." : "Book Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;