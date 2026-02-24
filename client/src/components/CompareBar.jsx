import { useAppContext } from "../context/AppContext";

const CompareBar = ({ onCompare }) => {
  const { compareRooms, clearCompare } = useAppContext();

  if (compareRooms.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-xl z-50">
      <span className="text-sm">
        {compareRooms.length} room selected
      </span>

      <button
        onClick={onCompare}
        disabled={compareRooms.length < 2}
        className="text-xs bg-white text-black px-3 py-1 rounded-full disabled:opacity-40"
      >
        Compare Now
      </button>

      <button
        onClick={clearCompare}
        className="text-xs border px-3 py-1 rounded-full"
      >
        Clear
      </button>
    </div>
  );
};

export default CompareBar;