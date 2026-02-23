import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const Wishlist = () => {
  const { getToken } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (roomId) => {
    try {
      const token = await getToken();

      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/wishlist/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setWishlist((prev) =>
          prev.filter((item) => item.room._id !== roomId)
        );
      }
    } catch (error) {
      console.error("Remove failed:", error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 text-lg">Loading wishlist...</p>
      </div>
    );
  }

  if (!wishlist.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-semibold">My Wishlist ❤️</h2>
        <p className="text-gray-500 mt-2">No saved rooms yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8">My Wishlist ❤️</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const room = item.room;

          return (
            <div
              key={room._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition"
            >
              <img
                src={room.images?.[0]}
                alt={room.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold">{room.name}</h3>
                <p className="text-gray-500 text-sm">
                  {room.hotel?.name}
                </p>

                <p className="font-bold mt-2">
                  ₹{room.price} / night
                </p>

                <button
                  onClick={() => removeFromWishlist(room._id)}
                  className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;