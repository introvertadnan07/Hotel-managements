import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const WishlistButton = ({ roomId, initiallyWishlisted }) => {
  const { getToken } = useAuth();
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);
  const [loading, setLoading] = useState(false);

  const toggleWishlist = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const token = await getToken();

      if (wishlisted) {
        // ✅ Remove
        const { data } = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/wishlist/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          setWishlisted(false);
        }
      } else {
        // ✅ Add
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/wishlist`,
          { roomId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          setWishlisted(true);
        }
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className={`p-2 rounded-full backdrop-blur-md transition 
        ${wishlisted ? "bg-red-500 text-white" : "bg-white/70 text-black"}
        hover:scale-110 active:scale-95`}
    >
      ❤️
    </button>
  );
};

export default WishlistButton;