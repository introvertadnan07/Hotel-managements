import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { facilityIcons, roomCommonData, assets } from "../assets/assets";
import StarRating from "../components/StarRating";
import StarRatingInput from "../components/StarRatingInput";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, currency, navigate, getToken, user } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);

  // ⭐ Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // ⭐ AI Summary
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // ❤️ Wishlist
  const [isSaved, setIsSaved] = useState(false);

  // 💰 Price Breakdown
  const [nights, setNights] = useState(0);

  // ✅ Normalize Image
  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_BACKEND_URL}/${img}`;
  };

  // ✅ Fetch Room
  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0] || "");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // ⭐ Fetch Reviews
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // ❤️ Check Wishlist
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
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchRoom();
    fetchReviews();
    fetchWishlistStatus();
  }, [id]);

  // 💰 Calculate Nights
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const diff =
        (new Date(checkOutDate) - new Date(checkInDate)) /
        (1000 * 60 * 60 * 24);
      setNights(diff > 0 ? diff : 0);
    }
  }, [checkInDate, checkOutDate]);

  // ✅ Availability
  const checkAvailability = async () => {
    try {
      if (!checkInDate || !checkOutDate)
        return toast.error("Select dates");

      const { data } = await axios.post(
        "/api/bookings/check-availability",
        { room: id, checkInDate, checkOutDate }
      );

      if (data.success) {
        setIsAvailable(data.isAvailable);
        data.isAvailable
          ? toast.success("Room available")
          : toast.error("Room not available");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Booking
  const onSubmithandler = async (e) => {
    e.preventDefault();
    if (!isAvailable) return checkAvailability();

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          checkInDate,
          checkOutDate,
          guests: Number(guests),
          paymentMethod: "Pay At Hotel",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Booking confirmed");
        navigate("/my-bookings");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ⭐ Submit Review
  const submitReview = async () => {
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
      } else toast.error(data.message);

    } catch (error) {
      toast.error(error.message);
    }
  };

  // ⭐ AI Summary (FIXED ROUTE)
  const getSummary = async () => {
    try {
      setLoadingSummary(true);

      const { data } = await axios.get(
        `/api/ai/review-summary/${id}`
      );

      if (data.success) setSummary(data.summary);

    } catch {
      toast.error("Summary failed");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ❤️ Toggle Wishlist
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
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!room)
    return <p className="pt-32 text-center">Loading...</p>;

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

        {/* ❤️ SAVE BUTTON */}
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

          {/* IMAGE */}
          <img
            src={getImageUrl(mainImage)}
            onClick={() => setShowModal(true)}
            className="w-full h-[420px] object-cover rounded-2xl shadow cursor-pointer"
          />

          {/* MODAL */}
          {showModal && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              onClick={() => setShowModal(false)}
            >
              <img
                src={getImageUrl(mainImage)}
                className="max-h-[80vh] rounded-xl"
              />
            </div>
          )}

          {/* THUMBS */}
          <div className="flex gap-3 mt-3">
            {room.images?.map((img) => (
              <img
                key={img}
                src={getImageUrl(img)}
                onClick={() => setMainImage(img)}
                className="w-24 h-20 object-cover rounded-lg cursor-pointer border"
              />
            ))}
          </div>

          {/* AI SUMMARY */}
          <div className="mt-8">
            <button
              onClick={getSummary}
              className="bg-black text-white px-5 py-2 rounded-lg"
            >
              {loadingSummary ? "Summarizing..." : "Summarize Reviews"}
            </button>

            {summary && (
              <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                {summary}
              </p>
            )}
          </div>

          {/* REVIEWS */}
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

          {/* ADD REVIEW */}
          {user && (
            <div className="mt-6">
              <StarRatingInput rating={rating} setRating={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border w-full p-2 mt-2 rounded-lg"
              />
              <button
                onClick={submitReview}
                className="bg-black text-white px-5 py-2 rounded-lg mt-2"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:w-[360px]">
          <div className="sticky top-28 border rounded-2xl shadow-lg p-5">

            <p className="text-2xl font-semibold">
              {currency} {room.pricePerNight}
              <span className="text-sm text-gray-500"> / night</span>
            </p>

            <form onSubmit={onSubmithandler} className="mt-4 space-y-3">
              <input type="date" onChange={(e)=>setCheckInDate(e.target.value)} className="w-full border p-2 rounded-lg" />
              <input type="date" onChange={(e)=>setCheckOutDate(e.target.value)} className="w-full border p-2 rounded-lg" />
              <input type="number" value={guests} onChange={(e)=>setGuests(e.target.value)} className="w-full border p-2 rounded-lg" />

              {/* 💰 PRICE BREAKDOWN */}
              {nights > 0 && (
                <div className="text-sm bg-gray-50 p-3 rounded-lg border">
                  <p>₹ {room.pricePerNight} × {nights} nights</p>
                  <p>Service fee: ₹ {serviceFee.toFixed(0)}</p>
                  <p className="font-medium">Total: ₹ {total.toFixed(0)}</p>
                </div>
              )}

              <button className="w-full bg-black text-white py-3 rounded-xl">
                {isAvailable ? "Reserve Now" : "Check Availability"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;