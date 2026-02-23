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

  // ❤️ Wishlist
  const [isSaved, setIsSaved] = useState(false);

  // ✅ Normalize image URLs
  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_BACKEND_URL}/${img}`;
  };

  // ✅ Fetch room
  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0] || "");
      }
    } catch (error) {
      toast.error("Failed to load room");
    }
  };

  // ⭐ Fetch reviews
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
      }
    } catch (error) {
        console.log("Review fetch error");
    }
  };

  // ❤️ Check wishlist
  const fetchWishlistStatus = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/wishlist/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) setIsSaved(data.saved);
    } catch (error) {}
  };

  useEffect(() => {
    fetchRoom();
    fetchReviews();
    fetchWishlistStatus();
  }, [id]);

  // ✅ Availability check
  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Select dates first");
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast.error("Invalid date selection");
      return;
    }

    try {
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
      toast.error("Availability check failed");
    }
  };

  // ✅ Booking
  const onSubmitHandler = async (e) => {
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
      } else toast.error(data.message);

    } catch (error) {
      toast.error("Booking failed");
    }
  };

  // ⭐ Submit Review
  const submitReview = async () => {
    if (!comment) {
      toast.error("Write something");
      return;
    }

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
      toast.error("Review failed");
    }
  };

  // ❤️ Toggle Wishlist
  const toggleSave = async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/wishlist/toggle",
        { roomId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from wishlist" : "Saved");
      }
    } catch (error) {
      toast.error("Wishlist failed");
    }
  };

  // 💰 Price calculation
  const nights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (new Date(checkOutDate) - new Date(checkInDate)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = nights * (room?.pricePerNight || 0);

  if (!room) return <p className="pt-32 text-center">Loading...</p>;

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

          <p className="text-gray-500 mt-1">{room.hotel?.address}</p>
        </div>

        {/* ❤️ Wishlist */}
        <button
          onClick={toggleSave}
          className="border px-4 py-2 rounded-full text-sm hover:bg-black hover:text-white transition"
        >
          {isSaved ? "Saved ❤️" : "Save 🤍"}
        </button>
      </div>

      {/* LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-12 mt-8">

        {/* LEFT */}
        <div className="flex-1">

          {/* Gallery */}
          <img
            src={getImageUrl(mainImage)}
            onClick={() => setShowModal(true)}
            className="w-full h-[420px] object-cover rounded-2xl shadow cursor-pointer"
          />

          <div className="flex gap-3 mt-3">
            {room.images?.map((img) => (
              <img
                key={img}
                src={getImageUrl(img)}
                onClick={() => setMainImage(img)}
                className={`w-24 h-20 object-cover rounded-lg cursor-pointer border ${
                  mainImage === img ? "border-black" : "border-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-3 mt-6">
            {room.amenities?.map((item) => (
              <div key={item} className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm">
                <img src={facilityIcons[item]} className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-xl p-4">
                  <p className="font-medium">{review.user?.username}</p>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>

            {user && (
              <div className="mt-6 border-t pt-4">
                <StarRatingInput rating={rating} setRating={setRating} />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border rounded-lg w-full p-2 mt-2 text-sm"
                  placeholder="Share your experience..."
                />
                <button onClick={submitReview} className="mt-3 bg-black text-white px-6 py-2 rounded-lg">
                  Submit Review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STICKY BOOKING CARD */}
        <div className="lg:w-[360px]">
          <div className="sticky top-28 border rounded-2xl shadow-lg p-5">

            <p className="text-2xl font-semibold">
              {currency} {room.pricePerNight}
              <span className="text-sm text-gray-500"> / night</span>
            </p>

            <form onSubmit={onSubmitHandler} className="mt-4 space-y-3">
              <input type="date" value={checkInDate} onChange={(e)=>setCheckInDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"/>
              <input type="date" value={checkOutDate} onChange={(e)=>setCheckOutDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"/>
              <input type="number" value={guests} min="1" onChange={(e)=>setGuests(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"/>

              {nights > 0 && (
                <div className="text-sm text-gray-600">
                  <p>{currency} {room.pricePerNight} × {nights} nights</p>
                  <p className="font-medium">Total: {currency} {totalPrice}</p>
                </div>
              )}

              <button className="w-full bg-black text-white py-3 rounded-xl">
                {isAvailable ? "Reserve Now" : "Check Availability"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <img
            src={getImageUrl(mainImage)}
            className="max-h-[80vh] rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default RoomDetails;