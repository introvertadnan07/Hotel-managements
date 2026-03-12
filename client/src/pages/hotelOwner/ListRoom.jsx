import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const { user, currency, axios } = useAppContext();

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/owner");
      if (data.success) setRooms(data.rooms || []);
      else toast.error(data.message || "Failed to load rooms");
    } catch (error) {
      console.error("Fetch Rooms Error:", error);
      toast.error("Failed to load rooms");
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      setUpdatingId(roomId);
      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomId ? { ...room, isAvailable: !room.isAvailable } : room
        )
      );
      const { data } = await axios.post("/api/rooms/toggle-availability", { roomId });
      if (!data.success) { toast.error(data.message || "Update failed"); fetchRooms(); }
    } catch (error) {
      console.error("Toggle Error:", error);
      toast.error("Failed to update availability");
      fetchRooms();
    } finally {
      setUpdatingId(null);
    }
  };

  const getSuggestion = async (roomId) => {
    try {
      const { data } = await axios.get(`/api/ai/price-suggestion/${roomId}`);
      if (data.success) {
        toast.success("AI Suggestion Ready 🤖");
        Swal.fire({
          title: "🤖 AI Pricing Assistant",
          html: `
            <div style="text-align:left;font-size:14px;line-height:1.6">
              <div style="background:#f9fafb;border-radius:12px;padding:14px;border:1px solid #e5e7eb;margin-bottom:12px;">
                <strong style="color:#2563eb">Recommended Price</strong>
                <div style="font-size:22px;font-weight:600;margin-top:6px">₹${data.price} / night</div>
              </div>
              <div style="background:#ffffff;border-radius:12px;padding:14px;border:1px solid #e5e7eb;">
                <strong>AI Explanation</strong>
                <p style="margin-top:6px;white-space:pre-line">${data.reason || data.suggestion}</p>
              </div>
            </div>
          `,
          width: 650,
          confirmButtonText: "Got it",
          confirmButtonColor: "#2563eb",
        });
      } else {
        toast.error("Failed to get suggestion");
      }
    } catch (error) {
      console.error("AI Price Error:", error);
      toast.error("AI pricing failed");
    }
  };

  const generateDescription = async (roomId) => {
    try {
      const { data } = await axios.get(`/api/ai/generate-description/${roomId}`);
      if (data.success) {
        toast.success("Description Generated ✨");
        Swal.fire({
          title: "✨ AI Generated Description",
          html: `
            <div style="text-align:left;font-size:14px;line-height:1.7;background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;">
              ${data.description}
            </div>
          `,
          width: 650,
          confirmButtonText: "Use this",
          confirmButtonColor: "#4f46e5",
        });
      } else {
        toast.error("Failed to generate description");
      }
    } catch (error) {
      console.error("AI Description Error:", error);
      toast.error("AI description failed");
    }
  };

  useEffect(() => { if (user) fetchRooms(); }, [user]);

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed rooms."
      />

      <p className="text-gray-500 dark:text-gray-400 mt-6 mb-2">All Rooms</p>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <table className="w-full text-sm text-left">

          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {["Name", "Facility", "Price / night", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-xs uppercase tracking-wide font-medium text-gray-500 dark:text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                  No rooms added yet
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {room.roomType || "Room"}
                    </div>
                    {room.category && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{room.category}</span>
                    )}
                  </td>

                  {/* Amenities */}
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs">
                    <p className="line-clamp-1">
                      {room.amenities?.length > 0 ? room.amenities.join(", ") : "No amenities"}
                    </p>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                    {currency} {room.pricePerNight}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3 flex-wrap">

                      {/* Availability toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAvailability(room._id)}
                          disabled={updatingId === room._id}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                            room.isAvailable ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
                            room.isAvailable ? "translate-x-5" : ""
                          }`} />
                        </button>
                        <span className={`text-xs font-medium ${
                          room.isAvailable
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}>
                          {room.isAvailable ? "Live" : "Off"}
                        </span>
                      </div>

                      {/* AI Price */}
                      <button
                        onClick={() => getSuggestion(room._id)}
                        className="text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                      >
                        Suggest Price 🤖
                      </button>

                      {/* AI Description */}
                      <button
                        onClick={() => generateDescription(room._id)}
                        className="text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition"
                      >
                        Generate Desc ✨
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