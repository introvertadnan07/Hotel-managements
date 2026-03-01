import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import StarRating from "../components/StarRating";
import StarRatingInput from "../components/StarRatingInput";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, currency, navigate, getToken, user } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  // -------------------------
  // Fetch Room
  // -------------------------
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

  // -------------------------
  // Fetch Reviews
  // -------------------------
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
      }
    } catch {
      toast.error("Failed to load reviews");
    }
  };

  // -------------------------
  // Wishlist Status
  // -------------------------
  const fetchWishlistStatus = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const saved = data.wishlist.some(
          (item) => item.room._id === id
        );
        setIsSaved(saved);
      }
    } catch {}
  };

  useEffect(() => {
    fetchRoom();
    fetchReviews();
    fetchWishlistStatus();
  }, [id]);

  // -------------------------
  // Availability Check
  // -------------------------
  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate)
      return toast.error("Select dates");

    try {
      setCheckingAvailability(true);

      const { data } = await axios.post(
        "/api/bookings/check-availability",
        {
          roomId: id,
          checkInDate,
          checkOutDate,
        }
      );

      if (data.success) {
        setIsAvailable(data.isAvailable);
        data.isAvailable
          ? toast.success("Room available")
          : toast.error("Room not available");
      }
    } catch {
      toast.error("Availability check failed");
    } finally {
      setCheckingAvailability(false);
    }
  };

  // -------------------------
  // Create Booking
  // -------------------------
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) return toast.error("Login required");

    if (!isAvailable) return checkAvailability();

    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.post(
        "/api/bookings/book",
        {
          roomId: id,
          checkInDate,
          checkOutDate,
          guests: Number(guests),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Booking confirmed");
        navigate("/my-bookings");
      }
    } catch {
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Submit Review
  // -------------------------
  const submitReview = async () => {
    if (!user) return toast.error("Login required");

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/reviews",
        { roomId: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Review added");
        setComment("");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to submit review");
    }
  };

  // -------------------------
  // Toggle Wishlist
  // -------------------------
  const toggleSave = async () => {
    if (!user) return toast.error("Login required");

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/wishlist/toggle",
        { roomId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setIsSaved(!isSaved);
        toast.success(data.message);
      }
    } catch {
      toast.error("Wishlist failed");
    }
  };

  if (!room) return <p className="pt-32 text-center">Loading...</p>;

  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          (new Date(checkOutDate) - new Date(checkInDate)) /
            (1000 * 60 * 60 * 24),
          0
        )
      : 0;

  const subtotal = nights * room.pricePerNight;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24 xl:px-32">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-playfair">
            {room.hotel?.name} ({room.roomType})
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={avgRating} />
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} • {reviews.length} reviews
            </span>
          </div>
        </div>

        <button
          onClick={toggleSave}
          className="text-sm border px-4 py-2 rounded-full"
        >
          {isSaved ? "❤️ Saved" : "🤍 Save"}
        </button>
      </div>

      <p className="text-gray-500 mt-1">
        {room.hotel?.address}
      </p>

      <div className="flex flex-col lg:flex-row gap-12 mt-8">

        {/* LEFT */}
        <div className="flex-1">
          <img
            src={getImageUrl(mainImage)}
            className="w-full h-[420px] object-cover rounded-2xl shadow"
          />

          {/* Reviews */}
          <div className="mt-10 space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-xl p-4">
                <p className="font-medium">{review.user?.username}</p>
                <StarRating rating={review.rating} />
                <p className="text-sm text-gray-600">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>

          {/* Add Review */}
          <div className="mt-8 border p-4 rounded-xl">
            <StarRatingInput rating={rating} setRating={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
              className="w-full border rounded p-2 mt-3"
            />
            <button
              onClick={submitReview}
              className="mt-3 bg-black text-white px-4 py-2 rounded"
            >
              Submit Review
            </button>
          </div>
        </div>

        {/* RIGHT BOOKING CARD */}
        <div className="lg:w-[360px]">
          <div className="sticky top-28 border rounded-2xl shadow-lg p-5 space-y-4">

            <p className="text-2xl font-semibold">
              {currency} {room.pricePerNight}
              <span className="text-sm text-gray-500"> / night</span>
            </p>

            <form onSubmit={handleBooking} className="space-y-3">

              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />

              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />

              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />

              {nights > 0 && (
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p>Subtotal: {currency} {subtotal}</p>
                  <p>Service Fee: {currency} {serviceFee}</p>
                  <p className="font-medium">Total: {currency} {total}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || checkingAvailability}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                {loading
                  ? "Processing..."
                  : isAvailable
                  ? "Book Now"
                  : "Check Availability"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;