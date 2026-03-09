import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { FaUserFriends, FaBed, FaBath, FaStar } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, currency, navigate, user } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  // Map
  const [mapCoords, setMapCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  // ✅ Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0] || "");
      }
    } catch {
      toast.error("Failed to load room");
    }
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

  useEffect(() => { fetchRoom(); fetchReviews(); }, [id]);
  useEffect(() => { checkCanReview(); }, [id, user]);

  // Geocode
  useEffect(() => {
    if (!room?.hotel?.address) return;
    const geocode = async () => {
      try {
        setMapLoading(true);
        const query = encodeURIComponent(room.hotel.address);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const results = await res.json();
        if (results.length > 0) {
          setMapCoords({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
        }
      } catch {} finally { setMapLoading(false); }
    };
    geocode();
  }, [room]);

  // ✅ Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    if (!checkInDate || !checkOutDate) return toast.error("Please select dates first");

    try {
      setCouponLoading(true);
      const { data } = await axios.post("/api/bookings/validate-coupon", {
        code: couponCode,
        total: total,
      });

      if (data.success) {
        setCouponApplied(data);
        toast.success(data.message);
      } else {
        toast.error(data.message);
        setCouponApplied(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid coupon");
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
  };

  // Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return toast.error("Please write a comment");
    try {
      setReviewLoading(true);
      const { data } = await axios.post("/api/reviews", {
        roomId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (data.success) {
        toast.success("Review submitted! ⭐");
        setReviewComment("");
        setReviewRating(5);
        setCanReview(false);
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  // Booking
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login required");
    if (!checkInDate || !checkOutDate) return toast.error("Select dates");
    if (guests > room.maxGuests) return toast.error(`Maximum ${room.maxGuests} guests allowed`);

    try {
      setLoading(true);
      const availabilityRes = await axios.post("/api/bookings/check-availability", {
        roomId: id, checkInDate, checkOutDate,
      });

      if (!availabilityRes.data.isAvailable) {
        toast.error("Room not available for selected dates");
        return;
      }

      const { data } = await axios.post("/api/bookings/book", {
        roomId: id,
        checkInDate,
        checkOutDate,
        guests: Number(guests),
        couponCode: couponApplied ? couponCode : undefined,
      });

      if (data.success) {
        toast.success("Booking confirmed! Check your email 📧");
        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch {
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!room) return <p className="pt-32 text-center">Loading...</p>;

  // Price calculations
  const nights = checkInDate && checkOutDate
    ? Math.max((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24), 0)
    : 0;

  const baseGuests = room.baseGuests || 2;
  const extraGuestPrice = room.extraGuestPrice || 500;
  let subtotal = nights * room.pricePerNight;
  if (guests > baseGuests) subtotal += (guests - baseGuests) * extraGuestPrice * nights;
  const serviceFee = subtotal * 0.1;
  let total = subtotal + serviceFee;
  const discount = couponApplied ? couponApplied.discount : 0;
  const finalTotal = Math.max(total - discount, 0);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24 xl:px-32">

      <h1 className="text-3xl font-playfair">
        {room.hotel?.name} ({room.roomType})
      </h1>

      <div className="flex flex-wrap gap-6 mt-4 text-gray-600 items-center">
        <div className="flex items-center gap-2"><FaUserFriends /><span>{room.maxGuests} Guests</span></div>
        <div className="flex items-center gap-2"><FaBed /><span>{room.beds || 1} Beds</span></div>
        <div className="flex items-center gap-2"><FaBath /><span>{room.bathrooms || 1} Bath</span></div>
        {avgRating && (
          <div className="flex items-center gap-1 text-yellow-500">
            <FaStar />
            <span className="font-medium text-gray-700">{avgRating}</span>
            <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <hr className="my-6" />

      <div className="flex flex-col lg:flex-row gap-12">

        {/* LEFT */}
        <div className="flex-1">

          <img src={getImageUrl(mainImage)} className="w-full h-[420px] object-cover rounded-2xl shadow" alt="room" />

          <div className="flex gap-3 mt-4 flex-wrap">
            {room.images?.map((img, index) => (
              <img key={index} src={getImageUrl(img)} onClick={() => setMainImage(img)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainImage === img ? "border-black" : "border-gray-200"}`}
                alt="thumbnail"
              />
            ))}
          </div>

          {/* Map */}
          <div className="mt-10">
            <h2 className="text-xl font-playfair mb-1">Hotel Location</h2>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <img src={assets.locationIcon} alt="" className="w-4 h-4" />
              {room.hotel?.address}
            </p>
            {mapLoading && (
              <div className="w-full h-[300px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">Loading map...</div>
            )}
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
            {!mapLoading && !mapCoords && (
              <div className="w-full h-[300px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">Map not available</div>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-playfair">Guest Reviews</h2>
              {avgRating && (
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="font-semibold text-sm">{avgRating}</span>
                  <span className="text-gray-400 text-xs">/ 5</span>
                </div>
              )}
            </div>

            {user && canReview && (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h3 className="font-medium mb-4">Write a Review</h3>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                      <FaStar className={`text-2xl ${star <= (hoverRating || reviewRating) ? "text-yellow-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 self-center">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || reviewRating]}
                  </span>
                </div>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none" required />
                <button type="submit" disabled={reviewLoading}
                  className="mt-3 bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 transition disabled:opacity-60">
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {!user && (
              <p className="text-sm text-gray-400 mb-6 bg-gray-50 px-4 py-3 rounded-xl">
                Please login and book this room to leave a review.
              </p>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="flex flex-col gap-6">
                {reviews.map((review) => (
                  <div key={review._id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {review.user?.image
                        ? <img src={review.user.image} alt="" className="w-full h-full object-cover" />
                        : <span className="text-sm font-medium text-gray-600">{review.user?.username?.[0]?.toUpperCase() || "U"}</span>
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{review.user?.username || "Guest"}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar key={star} className={`text-xs ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOOKING CARD */}
        <div className="lg:w-[360px]">
          <div className="sticky top-28 border rounded-2xl shadow-lg p-5 space-y-4">

            <p className="text-2xl font-semibold">
              {currency} {room.pricePerNight}
              <span className="text-sm text-gray-500"> / night</span>
            </p>

            <p className="text-sm text-gray-500">Max {room.maxGuests} guests allowed</p>

            <form onSubmit={handleBooking} className="space-y-3">
              <input type="date" value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); setCouponApplied(null); }}
                className="w-full border rounded px-3 py-2" required />
              <input type="date" value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); setCouponApplied(null); }}
                className="w-full border rounded px-3 py-2" required />
              <input type="number" min="1" max={room.maxGuests} value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full border rounded px-3 py-2" />

              {/* ✅ Coupon Input */}
              {nights > 0 && (
                <div>
                  {!couponApplied ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Promo code"
                        className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:border-black uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded transition disabled:opacity-60"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-sm">✅</span>
                        <span className="text-green-700 text-sm font-medium">{couponCode}</span>
                        <span className="text-green-600 text-xs">{couponApplied.message}</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500 text-xs transition">✕</button>
                    </div>
                  )}
                </div>
              )}

              {/* Price Summary */}
              {nights > 0 && (
                <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
                  <p className="flex justify-between"><span>Subtotal</span><span>{currency} {subtotal.toFixed(0)}</span></p>
                  <p className="flex justify-between"><span>Service Fee (10%)</span><span>{currency} {serviceFee.toFixed(0)}</span></p>
                  {couponApplied && (
                    <p className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- {currency} {discount.toFixed(0)}</span>
                    </p>
                  )}
                  <hr className="my-1" />
                  <p className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{currency} {finalTotal.toFixed(0)}</span>
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition">
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