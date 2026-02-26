import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // ✅ Safe image handler
  const getImageUrl = (img) => {
    if (!img) return assets.hostedDefaultImage;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  // ✅ Fetch user bookings
  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.post("/api/bookings/user");

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load bookings");
    }
  };

  // ✅ Stripe payment
  const handlePayment = async (bookingId) => {
    try {
      setPayingId(bookingId);

      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        { bookingId }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
        setPayingId(null);
      }
    } catch (error) {
      toast.error("Payment failed");
      setPayingId(null);
    }
  };

  // ✅ Secure invoice download (FIXED)
  const downloadInvoice = async (bookingId) => {
    try {
      setDownloadingId(bookingId);

      const response = await axios.get(
        `/api/bookings/invoice/${bookingId}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      toast.error("Invoice download failed");
    } finally {
      setDownloadingId(null);
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
        {bookings.length === 0 ? (
          <p className="py-10 text-gray-500">No bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-6 border-b py-6"
            >
              {/* LEFT SECTION */}
              <div className="flex gap-4">
                <img
                  src={getImageUrl(booking.room?.images?.[0])}
                  alt="hotel"
                  className="w-28 h-24 rounded-lg object-cover"
                />

                <div>
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

              {/* DATE SECTION */}
              <div className="text-sm">
                <p>
                  Check-In:{" "}
                  {new Date(booking.checkInDate).toDateString()}
                </p>
                <p>
                  Check-Out:{" "}
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
              </div>

              {/* ACTION SECTION */}
              <div className="flex gap-3 items-center">
                {!booking.isPaid ? (
                  <button
                    onClick={() => handlePayment(booking._id)}
                    disabled={payingId === booking._id}
                    className="px-4 py-1.5 text-sm border rounded-full"
                  >
                    {payingId === booking._id
                      ? "Redirecting..."
                      : "Pay Now"}
                  </button>
                ) : (
                  <button
                    onClick={() => downloadInvoice(booking._id)}
                    disabled={downloadingId === booking._id}
                    className="px-4 py-1.5 text-sm bg-black text-white rounded-full"
                  >
                    {downloadingId === booking._id
                      ? "Downloading..."
                      : "Download Invoice"}
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