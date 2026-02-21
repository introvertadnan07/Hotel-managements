import React, { useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const AddRoom = () => {
  const { getToken } = useAuth();

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [roomType, setRoomType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");

  const [amenities, setAmenities] = useState({
    "Free WiFi": false,
    "Free Breakfast": false,
    "Free Service": false,
    "Mountain View": false,
    "Pool Access": false,
  });

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!roomType || !pricePerNight) {
      toast.error("Please fill all fields");
      return;
    }

    const hasAtLeastOneImage = Object.values(images).some((img) => img);
    if (!hasAtLeastOneImage) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("roomType", roomType);
      formData.append("pricePerNight", pricePerNight);

      const selectedAmenities = Object.keys(amenities).filter(
        (a) => amenities[a]
      );

      formData.append("amenities", JSON.stringify(selectedAmenities));

      Object.values(images).forEach((img) => {
        if (img) formData.append("images", img);
      });

      const token = await getToken();
      if (!token) {
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      // ✅ FIXED API CALL (uses backend URL)
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Room added successfully");

        setRoomType("");
        setPricePerNight("");

        setAmenities({
          "Free WiFi": false,
          "Free Breakfast": false,
          "Free Service": false,
          "Mountain View": false,
          "Pool Access": false,
        });

        setImages({
          1: null,
          2: null,
          3: null,
          4: null,
        });
      } else {
        toast.error(data.message || "Failed to add room");
      }
    } catch (err) {
      console.error("Add room error:", err);

      toast.error(
        err.response?.data?.message || "Failed to add room"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <form onSubmit={onSubmitHandler} className="space-y-8">

        <Title
          align="left"
          font="outfit"
          title="Add Room"
          subTitle="Add room details, pricing and amenities"
        />

        {/* ✅ Images */}
        <div>
          <p className="font-medium mb-2">Images</p>
          <div className="flex gap-4 flex-wrap">
            {Object.keys(images).map((key) => (
              <label key={key} className="cursor-pointer">
                <img
                  src={
                    images[key]
                      ? URL.createObjectURL(images[key])
                      : assets.uploadArea
                  }
                  alt=""
                  className="w-32 h-24 object-cover rounded border"
                />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setImages({
                      ...images,
                      [key]: e.target.files[0],
                    })
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* ✅ Room Type & Price */}
        <div className="flex gap-6">
          <div>
            <p className="mb-1">Room Type</p>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option>Single Bed</option>
              <option>Double Bed</option>
              <option>Luxury Room</option>
              <option>Family Suite</option>
            </select>
          </div>

          <div>
            <p className="mb-1">Price / night</p>
            <input
              type="number"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              className="border rounded px-3 py-2 w-32"
            />
          </div>
        </div>

        {/* ✅ Amenities */}
        <div>
          <p className="font-medium mb-2">Amenities</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {Object.keys(amenities).map((amenity) => (
              <label key={amenity} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={amenities[amenity]}
                  onChange={() =>
                    setAmenities({
                      ...amenities,
                      [amenity]: !amenities[amenity],
                    })
                  }
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {/* ✅ Submit Button */}
        <button
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Adding..." : "Add Room"}
        </button>

      </form>
    </div>
  );
};

export default AddRoom;