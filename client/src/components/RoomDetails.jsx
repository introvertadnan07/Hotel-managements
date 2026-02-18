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

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);

  // ✅ Fetch Room
  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);

      if (data.success) {
        setRoom(data.room);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  // ✅ Check Availability
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
        {
          room: id,
          checkInDate,
          checkOutDate,
        }
      );

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          toast.success("Room is available");
        } else {
          setIsAvailable(false);
          toast.error("Room not available");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Book Room
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

      {/* ✅ Title Section */}
      <h1 className="text-3xl font-playfair">
        {room.hotel?.name} ({room.roomType})
      </h1>

      <div className="flex items-center gap-2 mt-2">
        <StarRating />
        <span className="text-sm text-gray-500">200+ reviews</span>
      </div>

      <p className="text-gray-500 mt-1">{room.hotel?.address}</p>

      {/* ✅ PRICE */}
      <p className="text-2xl font-semibold mt-4">
        {currency} {room.pricePerNight}
        <span className="text-base text-gray-500"> /night</span>
      </p>

      {/* ✅ AMENITIES (SAFE ICON FIX) */}
      <div className="flex flex-wrap gap-3 mt-4">
        {room.amenities?.map((item, index) => {
          const icon = facilityIcons[item];

          return (
            <div
              key={index}
              className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm"
            >
              {icon && (
                <img
                  src={icon}
                  alt={item}
                  className="w-4 h-4"
                />
              )}
              <span>{item}</span>
            </div>
          );
        })}
      </div>

      {/* ✅ BOOKING BAR */}
      <form
        onSubmit={onSubmithandler}
        className="flex flex-col md:flex-row items-center gap-4 mt-8 bg-white shadow-sm border rounded-xl p-4"
      >
        <div>
          <label className="text-sm text-gray-500">Check-In</label>
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
        </div>

        <div>
          <label className="text-sm text-gray-500">Check-Out</label>
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
        </div>

        <div>
          <label className="text-sm text-gray-500">Guests</label>
          <input
            type="number"
            value={guests}
            min="1"
            onChange={(e) => setGuests(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-20"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {isAvailable ? "Book Now" : "Check Availability"}
        </button>
      </form>

      {/* ✅ FEATURES */}
      <div className="mt-10 space-y-4">
        {roomCommonData.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
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

      {/* ✅ DESCRIPTION */}
      <div className="mt-10 border-t pt-6">
        <p className="text-gray-600 leading-relaxed">
          Enjoy a comfortable stay designed around your convenience and availability.
          Room placement is thoughtfully managed to deliver the best possible experience.
          Rates are dynamically adjusted based on your selected guest count.
          We recommend verifying your dates and preferences before booking.
        </p>
      </div>
    </div>
  );
};

export default RoomDetails;
