import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { FaUserFriends, FaBed, FaBath } from "react-icons/fa";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, currency, navigate, user } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  // ================= Fetch Room =================
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

  useEffect(() => {
    fetchRoom();
  }, [id]);

  // ================= Booking =================
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) return toast.error("Login required");

    if (!checkInDate || !checkOutDate)
      return toast.error("Select dates");

    if (guests > room.maxGuests) {
      return toast.error(`Maximum ${room.maxGuests} guests allowed`);
    }

    try {
      setLoading(true);

      const availabilityRes = await axios.post(
        "/api/bookings/check-availability",
        {
          roomId: id,
          checkInDate,
          checkOutDate,
        }
      );

      if (!availabilityRes.data.isAvailable) {
        toast.error("Room not available for selected dates");
        return;
      }

      const { data } = await axios.post("/api/bookings/book", {
        roomId: id,
        checkInDate,
        checkOutDate,
        guests: Number(guests),
      });

      if (data.success) {
        toast.success("Booking confirmed");
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

  // ================= Nights Calculation =================
  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          (new Date(checkOutDate) - new Date(checkInDate)) /
            (1000 * 60 * 60 * 24),
          0
        )
      : 0;

  // ================= Price Calculation =================
  const baseGuests = room.baseGuests || 2;
  const extraGuestPrice = room.extraGuestPrice || 500;

  let subtotal = nights * room.pricePerNight;

  if (guests > baseGuests) {
    const extraGuests = guests - baseGuests;
    subtotal += extraGuests * extraGuestPrice * nights;
  }

  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24 xl:px-32">

      {/* Title */}
      <h1 className="text-3xl font-playfair">
        {room.hotel?.name} ({room.roomType})
      </h1>

      {/* Capacity Icons */}
      <div className="flex gap-6 mt-4 text-gray-600">

        <div className="flex items-center gap-2">
          <FaUserFriends />
          <span>{room.maxGuests} Guests</span>
        </div>

        <div className="flex items-center gap-2">
          <FaBed />
          <span>{room.beds || 1} Beds</span>
        </div>

        <div className="flex items-center gap-2">
          <FaBath />
          <span>{room.bathrooms || 1} Bath</span>
        </div>

      </div>

      <hr className="my-6" />

      <div className="flex flex-col lg:flex-row gap-12">

        {/* LEFT SIDE */}
        <div className="flex-1">

          {/* Main Image */}
          <img
            src={getImageUrl(mainImage)}
            className="w-full h-[420px] object-cover rounded-2xl shadow"
            alt="room"
          />

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {room.images?.map((img, index) => (
              <img
                key={index}
                src={getImageUrl(img)}
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                  mainImage === img ? "border-black" : "border-gray-200"
                }`}
                alt="thumbnail"
              />
            ))}
          </div>

        </div>

        {/* BOOKING CARD */}
        <div className="lg:w-[360px]">

          <div className="sticky top-28 border rounded-2xl shadow-lg p-5 space-y-4">

            <p className="text-2xl font-semibold">
              {currency} {room.pricePerNight}
              <span className="text-sm text-gray-500"> / night</span>
            </p>

            <p className="text-sm text-gray-500">
              Max {room.maxGuests} guests allowed
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
                max={room.maxGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />

              {nights > 0 && (
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p>Subtotal: {currency} {subtotal}</p>
                  <p>Service Fee: {currency} {serviceFee}</p>
                  <p className="font-medium">
                    Total: {currency} {total}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
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