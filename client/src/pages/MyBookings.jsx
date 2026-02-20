import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken, user } = useAppContext();
  const [bookings, setBooking] = useState([]);

  // ✅ Normalize image path
  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;

    if (img.startsWith("http")) return img;

    if (img.startsWith("/")) img = img.slice(1);

    return `${import.meta.env.VITE_BACKEND_URL}/${img}`;
  };

  const fetchUserBookings = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.post(
        "/api/bookings/user",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setBooking(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchUserBookings();
  }, [user]);

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Manage your hotel reservations easily."
        align="left"
      />

      <div className="max-w-6xl mt-10 w-full text-gray-800">
        <div className="hidden md:grid grid-cols-[3fr_2fr_1fr] border-b pb-3 font-medium">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.length === 0 ? (
          <p className="py-10 text-gray-500">No bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-6 border-b py-6"
            >
              {/* ✅ Hotel Info */}
              <div className="flex gap-4">
                <img
                  src={getImageUrl(booking.room?.images?.[0])}
                  alt="hotel"
                  className="w-28 h-24 rounded-lg object-cover"
                />

                <div className="space-y-1">
                  <p className="font-playfair text-xl">
                    {booking.hotel?.name}
                    <span className="text-sm text-gray-500">
                      {" "}({booking.room?.roomType})
                    </span>
                  </p>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src={assets.locationIcon} className="h-4" />
                    <span>{booking.hotel?.address}</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src={assets.guestsIcon} className="h-4" />
                    <span>Guests: {booking.guests}</span>
                  </div>

                  <p className="font-medium">
                    Total: {booking.totalPrice}
                  </p>
                </div>
              </div>

              {/* ✅ Dates */}
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Check-In:</span>{" "}
                  {new Date(booking.checkInDate).toDateString()}
                </p>
                <p>
                  <span className="font-medium">Check-Out:</span>{" "}
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
              </div>

              {/* ✅ Payment */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      booking.isPaid ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      booking.isPaid ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {booking.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>

                {!booking.isPaid && (
                  <button className="w-fit px-4 py-1.5 text-sm border rounded-full hover:bg-gray-100">
                    Pay Now
                  </button>
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