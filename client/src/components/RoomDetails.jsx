import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, currency, navigate, getToken } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);

  // ✅ Normalize image path (handles all DB formats)
  const getImageUrl = (img) => {
    if (!img) return "";

    // If already full URL
    if (img.startsWith("http")) return img;

    // Remove leading slash if exists
    if (img.startsWith("/")) img = img.slice(1);

    return `${import.meta.env.VITE_BACKEND_URL}/${img}`;
  };

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);

      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0]);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const checkAvailability = async () => {
    try {
      if (!checkInDate || !checkOutDate) {
        toast.error("Please select dates");
        return;
      }

      if (checkInDate >= checkOutDate) {
        toast.error("Check-In must be before Check-Out");
        return;
      }

      const { data } = await axios.post(
        "/api/bookings/check-availability",
        { room: id, checkInDate, checkOutDate }
      );

      if (data.success) {
        setIsAvailable(data.isAvailable);

        if (data.isAvailable) toast.success("Room is available");
        else toast.error("Room not available");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmithandler = async (e) => {
    e.preventDefault();

    if (!isAvailable) {
      return checkAvailability();
    }

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod: "Pay At Hotel",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
        window.scrollTo(0, 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!room) return <p className="pt-32 text-center">Loading...</p>;

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24 xl:px-32">
      <h1 className="text-3xl font-playfair">
        {room.hotel?.name} ({room.roomType})
      </h1>

      <div className="flex items-center gap-2 mt-2">
        <StarRating />
        <span className="text-sm text-gray-500">200+ reviews</span>
      </div>

      <p className="text-gray-500 mt-1">{room.hotel?.address}</p>

      {/* ✅ Images */}
      <div className="mt-6">
        <img
          src={getImageUrl(mainImage)}
          alt="room"
          className="w-full h-[380px] object-cover rounded-xl"
        />

        <div className="flex gap-3 mt-3">
          {room.images?.map((img) => (
            <img
              key={img}
              src={getImageUrl(img)}
              onClick={() => setMainImage(img)}
              alt="thumb"
              className={`w-24 h-20 object-cover rounded-lg cursor-pointer border ${
                mainImage === img ? "border-black" : "border-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ✅ Amenities */}
      <div className="flex flex-wrap gap-3 mt-6">
        {room.amenities?.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm"
          >
            <img
              src={facilityIcons[item]}
              alt={item}
              className="w-4 h-4"
            />
            {item}
          </div>
        ))}
      </div>

      {/* ✅ Booking Bar */}
      <form
        onSubmit={onSubmithandler}
        className="flex flex-col md:flex-row items-center gap-4 mt-8 bg-white shadow-sm border rounded-xl p-4"
      >
        <input
          type="date"
          value={checkInDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setCheckInDate(e.target.value);
            setIsAvailable(false);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={checkOutDate}
          min={checkInDate}
          disabled={!checkInDate}
          onChange={(e) => {
            setCheckOutDate(e.target.value);
            setIsAvailable(false);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="number"
          value={guests}
          min="1"
          onChange={(e) => setGuests(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-20"
        />

        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg">
          {isAvailable ? "Book Now" : "Check Availability"}
        </button>
      </form>

      {/* ✅ Features */}
      <div className="mt-10 space-y-4">
        {roomCommonData.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <img src={item.icon} alt="" className="w-5 mt-1" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomDetails;
