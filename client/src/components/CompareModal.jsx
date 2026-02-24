import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const CompareModal = ({ onClose }) => {
  const { compareRooms, axios } = useAppContext();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const compare = async () => {
    try {
      setLoading(true);

      const { data } = await axios.post("/api/ai/compare-rooms", {
        room1: compareRooms[0]._id,
        room2: compareRooms[1]._id,
      });

      if (data.success) setResult(data.comparison);
    } catch {
      setResult("Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[600px] max-w-[95%]">
        <h2 className="text-xl font-semibold mb-4">
          Room Comparison ⚖️
        </h2>

        <button
          onClick={compare}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Comparing..." : "Generate AI Comparison"}
        </button>

        {result && (
          <p className="mt-4 text-sm text-gray-700">
            {result}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CompareModal;