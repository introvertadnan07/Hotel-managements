import { useState, useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isInRange = (date, start, end) => date >= start && date <= end;

const BookingCalendar = ({ bookings = [], isOwner = false }) => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null);

  const { year, month } = current;

  const prevMonth = () => {
    setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
    setSelected(null);
  };

  const nextMonth = () => {
    setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });
    setSelected(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const parsedBookings = useMemo(() =>
    bookings.map(b => ({
      ...b,
      checkIn: new Date(b.checkInDate),
      checkOut: new Date(b.checkOutDate),
    })), [bookings]);

  const getDateBookings = (day) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    return parsedBookings.filter(b => isInRange(date, b.checkIn, b.checkOut));
  };

  const getDayType = (day) => {
    if (!day) return "empty";
    const date = new Date(year, month, day);
    const dayBookings = getDateBookings(day);
    if (dayBookings.length === 0) return "free";
    const hasCheckIn = dayBookings.some(b => isSameDay(b.checkIn, date));
    const hasCheckOut = dayBookings.some(b => isSameDay(b.checkOut, date));
    if (hasCheckIn && hasCheckOut) return "both";
    if (hasCheckIn) return "checkin";
    if (hasCheckOut) return "checkout";
    return "occupied";
  };

  const selectedBookings = selected ? getDateBookings(selected) : [];

  const accentClasses = {
    checkin:  isOwner ? "bg-blue-500 text-white"     : "bg-emerald-500 text-white",
    checkout: isOwner ? "bg-blue-300 text-blue-900"  : "bg-emerald-300 text-emerald-900",
    occupied: isOwner ? "bg-blue-100 text-blue-700"  : "bg-emerald-100 text-emerald-700",
    both:     isOwner ? "bg-indigo-500 text-white"   : "bg-teal-500 text-white",
  };

  const headerBg = isOwner ? "bg-blue-600" : "bg-emerald-600";
  const ringColor = isOwner ? "ring-blue-600" : "ring-emerald-600";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${headerBg}`}>
        <button onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-lg">{MONTHS[month]} {year}</p>
          <p className="text-white/70 text-xs">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={nextMonth}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 p-3 gap-1">
        {cells.map((day, i) => {
          const type = getDayType(day);
          const isToday = day && isSameDay(new Date(year, month, day), today);
          const isSelected = day && selected === day;
          const hasBookings = type !== "free" && type !== "empty";

          return (
            <button key={i}
              disabled={!day}
              onClick={() => day && setSelected(selected === day ? null : day)}
              className={[
                "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all",
                !day ? "opacity-0 pointer-events-none" : "cursor-pointer",
                isSelected ? `ring-2 ring-offset-1 ${ringColor}` : "",
                type === "checkin"  ? accentClasses.checkin  : "",
                type === "checkout" ? accentClasses.checkout : "",
                type === "occupied" ? accentClasses.occupied : "",
                type === "both"     ? accentClasses.both     : "",
                type === "free"     ? "text-gray-700 hover:bg-gray-100" : "hover:opacity-90",
                isToday && type === "free" ? "ring-2 ring-gray-300 ring-offset-1" : "",
              ].join(" ")}>
              <span>{day}</span>
              {hasBookings && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3">
        {[
          { color: isOwner ? "bg-blue-500"   : "bg-emerald-500", label: "Check-in" },
          { color: isOwner ? "bg-blue-300"   : "bg-emerald-300", label: "Check-out" },
          { color: isOwner ? "bg-blue-100"   : "bg-emerald-100", label: "Staying" },
          { color: isOwner ? "bg-indigo-500" : "bg-teal-500",    label: "Same day" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Selected day popup */}
      {selected && (
        <div className="mx-4 mb-4 border border-gray-100 rounded-xl overflow-hidden">
          <div className={`px-4 py-2 text-sm font-semibold text-white ${headerBg}`}>
            {MONTHS[month]} {selected}, {year}
            {selectedBookings.length === 0 && " — No bookings"}
          </div>
          {selectedBookings.length > 0 && (
            <div className="divide-y divide-gray-100">
              {selectedBookings.map((b, i) => (
                <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {isOwner ? (b.user?.username || "Guest") : (b.hotel?.name || b.room?.roomType || "Room")}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(b.checkInDate).toDateString()} → {new Date(b.checkOutDate).toDateString()}
                    </p>
                    {isOwner && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Room: {b.room?.roomType || "—"} · ₹{Number(b.totalPrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    b.isPaid ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {b.status || (b.isPaid ? "Paid" : "Pending")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
