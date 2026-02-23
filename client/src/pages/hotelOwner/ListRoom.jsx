import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const { getToken, user, currency, axios } = useAppContext();

  const fetchRooms = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get("/api/rooms/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message || "Failed to load rooms");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rooms");
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      setUpdatingId(roomId);

      const token = await getToken();
      if (!token) return;

      // ✅ Optimistic UI update
      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomId
            ? { ...room, isAvailable: !room.isAvailable }
            : room
        )
      );

      const { data } = await axios.post(
        "/api/rooms/toggle-availability",
        { roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        toast.error(data.message);
        fetchRooms();
      }
    } catch (error) {
      toast.error("Failed to update availability");
      fetchRooms();
    } finally {
      setUpdatingId(null);
    }
  };

  // ⭐ AI PRICE SUGGESTION
  const getSuggestion = async (roomId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/ai/price-suggestion/${roomId}`
      );

      if (data.success) {
        toast.success("AI Suggestion Ready 🤖");
        alert(data.suggestion);
      } else {
        toast.error("Failed to get suggestion");
      }
    } catch (error) {
      console.error(error);
      toast.error("AI pricing failed");
    }
  };

  // ⭐ NEW → AI DESCRIPTION GENERATOR
  const generateDescription = async (roomId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/ai/generate-description/${roomId}`
      );

      if (data.success) {
        toast.success("Description Generated ✨");
        alert(data.description);
      } else {
        toast.error("Failed to generate description");
      }
    } catch (error) {
      console.error(error);
      toast.error("AI description failed");
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed rooms."
      />

      <p className="text-gray-500 mt-6 mb-2">All Rooms</p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Facility</th>
              <th className="px-6 py-3">Price / night</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No rooms added yet
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room._id} className="border-t">
                  <td className="px-6 py-4">{room.roomType}</td>

                  <td className="px-6 py-4">
                    {room.amenities.join(", ")}
                  </td>

                  <td className="px-6 py-4">
                    {currency} {room.pricePerNight}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      
                      {/* ✅ Toggle Availability */}
                      <button
                        onClick={() => toggleAvailability(room._id)}
                        disabled={updatingId === room._id}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                          room.isAvailable ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transform transition ${
                            room.isAvailable ? "translate-x-5" : ""
                          }`}
                        />
                      </button>

                      {/* 🤖 AI Price */}
                      <button
                        onClick={() => getSuggestion(room._id)}
                        className="text-xs border px-3 py-1 rounded-full hover:bg-black hover:text-white transition"
                      >
                        Suggest Price 🤖
                      </button>

                      {/* ✨ AI Description */}
                      <button
                        onClick={() => generateDescription(room._id)}
                        className="text-xs border px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition"
                      >
                        Generate Description ✨
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;