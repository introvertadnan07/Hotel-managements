import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken, user } = useAppContext();

  const [bookings, setBooking] = useState([]);
  const [payingId, setPayingId] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
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
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const token = await getToken();

      if (!token) {
        toast.error("Please login first");
        return;
      }

      setPayingId(bookingId);

      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
        setPayingId(null);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setPayingId(null);
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

                  <p className="font-medium">
                    Total: ₹ {booking.totalPrice?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <p>Check-In: {new Date(booking.checkInDate).toDateString()}</p>
                <p>Check-Out: {new Date(booking.checkOutDate).toDateString()}</p>
              </div>

              <div>
                {!booking.isPaid && (
                  <button
                    onClick={() => handlePayment(booking._id)}
                    disabled={payingId === booking._id}
                    className="px-4 py-1.5 text-sm border rounded-full"
                  >
                    {payingId === booking._id ? "Redirecting..." : "Pay Now"}
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