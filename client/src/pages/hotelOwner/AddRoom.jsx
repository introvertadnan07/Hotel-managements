import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
  FiUpload, FiX, FiWifi, FiCoffee, FiStar,
  FiEye, FiUsers, FiDollarSign, FiHome,
  FiDroplet, FiTriangle, FiAlignLeft, FiChevronDown,
} from "react-icons/fi";
import { MdOutlinePool } from "react-icons/md";

const AMENITIES = [
  { label: "Free WiFi",      icon: <FiWifi /> },
  { label: "Free Breakfast", icon: <FiCoffee /> },
  { label: "Free Service",   icon: <FiStar /> },
  { label: "Mountain View",  icon: <FiTriangle /> },
  { label: "Pool Access",    icon: <MdOutlinePool /> },
  { label: "Ocean View",     icon: <FiEye /> },
  { label: "Balcony",        icon: <FiHome /> },
  { label: "Bathtub",        icon: <FiDroplet /> },
];

const ROOM_TYPES = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
const CATEGORIES = [
  { label: "Budget",   desc: "Affordable comfort",     emoji: "💰" },
  { label: "Standard", desc: "Great value for money",  emoji: "⭐" },
  { label: "Premium",  desc: "Enhanced experience",    emoji: "✨" },
  { label: "Luxury",   desc: "World-class indulgence", emoji: "👑" },
];

const Section = ({ number, title, subtitle, children }) => (
  <div>
    <div className="flex items-start gap-4 mb-5">
      <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="font-playfair text-lg text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="ml-12">{children}</div>
  </div>
);

const Counter = ({ label, value, onChange, min = 0, max = 20 }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white transition text-lg leading-none">−</button>
      <span className="w-6 text-center font-semibold text-gray-900 dark:text-white">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white transition text-lg leading-none">+</button>
    </div>
  </div>
);

const AddRoom = () => {
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  // ✅ Hotels list for selector
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [hotelsLoading, setHotelsLoading] = useState(true);

  const [images, setImages]                     = useState([]);
  const [roomType, setRoomType]                 = useState("");
  const [category, setCategory]                 = useState("Standard");
  const [description, setDescription]           = useState("");
  const [pricePerNight, setPricePerNight]       = useState("");
  const [maxGuests, setMaxGuests]               = useState(2);
  const [baseGuests, setBaseGuests]             = useState(2);
  const [extraGuestPrice, setExtraGuestPrice]   = useState(500);
  const [beds, setBeds]                         = useState(1);
  const [bathrooms, setBathrooms]               = useState(1);
  const [amenities, setAmenities]               = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [dragOver, setDragOver]                 = useState(false);

  const charLimit = 500;

  // ✅ Fetch owner's hotels on mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true);
        const token = await getToken();
        const { data } = await axios.get(
       `${import.meta.env.VITE_BACKEND_URL}/api/hotels/owner`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setHotels(data.hotels || []);
          if (data.hotels?.length === 1) setSelectedHotelId(data.hotels[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch hotels:", err);
      } finally {
        setHotelsLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const addImages = (files) => {
    const newImgs = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .slice(0, 4 - images.length)
      .map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs].slice(0, 4));
  };

  const removeImage = (index) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const toggleAmenity = (label) => {
    setAmenities(prev =>
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
    );
  };

  const resetForm = () => {
    setRoomType(""); setCategory("Standard"); setDescription("");
    setPricePerNight(""); setMaxGuests(2); setBaseGuests(2);
    setExtraGuestPrice(500); setBeds(1); setBathrooms(1); setAmenities([]);
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    if (hotels.length > 1) setSelectedHotelId("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!selectedHotelId)                        return toast.error("Please select a hotel");
    if (!roomType)                               return toast.error("Select a room type");
    if (!pricePerNight || Number(pricePerNight) <= 0) return toast.error("Enter a valid price");
    if (images.length === 0)                     return toast.error("Upload at least one image");
    if (baseGuests > maxGuests)                  return toast.error("Base guests cannot exceed max guests");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hotelId", selectedHotelId); // ✅ send hotelId
      formData.append("roomType", roomType);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("pricePerNight", pricePerNight);
      formData.append("maxGuests", maxGuests);
      formData.append("baseGuests", baseGuests);
      formData.append("extraGuestPrice", extraGuestPrice);
      formData.append("beds", beds);
      formData.append("bathrooms", bathrooms);
      formData.append("amenities", JSON.stringify(amenities));
      images.forEach(({ file }) => formData.append("images", file));

      const token = await getToken();
      const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/rooms`,
      formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }
);
      

      if (data.success) {
        toast.success("Room added successfully! 🎉");
        resetForm();
      } else {
        toast.error(data.message || "Failed to add room");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl pb-16">

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-playfair text-3xl text-gray-900 dark:text-white">Add New Room</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in the details below to list your room</p>
        <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mt-4" />
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-12">

        {/* ── 00 Select Hotel ──────────────────────────── */}
        <Section number="00" title="Select Hotel"
          subtitle="Choose which hotel this room belongs to">
          {hotelsLoading ? (
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : hotels.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ No hotels registered yet. Please register a hotel first from the Dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotels.map(hotel => (
                <button key={hotel._id} type="button"
                  onClick={() => setSelectedHotelId(hotel._id)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    selectedHotelId === hotel._id
                      ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}>
                  <span className="font-semibold text-sm">{hotel.name}</span>
                  <span className={`text-xs mt-0.5 ${
                    selectedHotelId === hotel._id ? "text-gray-300 dark:text-gray-600" : "text-gray-400"
                  }`}>
                    📍 {hotel.city}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* ── 01 Images ───────────────────────────────── */}
        <Section number="01" title="Room Photos"
          subtitle="Upload up to 4 high-quality images. First image is the cover.">
          <div
            onClick={() => images.length < 4 && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
              ${dragOver ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"}
              ${images.length >= 4 ? "opacity-50 cursor-not-allowed" : ""}`}>
            <FiUpload className="mx-auto text-3xl text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {images.length >= 4 ? "Maximum 4 images uploaded" : "Click or drag & drop images here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP • Max 10MB each</p>
            <input ref={fileInputRef} type="file" hidden multiple accept="image/*"
              onChange={(e) => addImages(e.target.files)} />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX className="text-xs" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 4 - images.length }).map((_, i) => (
                <div key={`empty-${i}`} onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-400 transition">
                  <FiUpload className="text-gray-300 dark:text-gray-600" />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── 02 Category ─────────────────────────────── */}
        <Section number="02" title="Room Category" subtitle="Choose the tier that best matches your room">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(({ label, desc, emoji }) => (
              <button key={label} type="button" onClick={() => setCategory(label)}
                className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl text-sm font-medium transition-all
                  ${category === label
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                <span className="text-xl">{emoji}</span>
                <span className="font-semibold">{label}</span>
                <span className={`text-[10px] text-center leading-tight ${category === label ? "text-gray-300 dark:text-gray-600" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 03 Room Type & Pricing ───────────────────── */}
        <Section number="03" title="Room Type & Pricing" subtitle="Select the room type and nightly rate">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Room Type</label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_TYPES.map(type => (
                  <button key={type} type="button" onClick={() => setRoomType(type)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${roomType === type
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Price Per Night</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)}
                    placeholder="2000" min="1"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-white transition text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Extra Guest Charge / night</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input type="number" value={extraGuestPrice} onChange={(e) => setExtraGuestPrice(Number(e.target.value))}
                    min="0"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-white transition text-sm" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 04 Description ──────────────────────────── */}
        <Section number="04" title="Room Description" subtitle="Write a compelling description to attract guests">
          <div className="relative">
            <div className="absolute top-3 left-3 text-gray-400"><FiAlignLeft /></div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your room — highlight unique features, views, ambiance..."
              rows={5} maxLength={charLimit}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-white transition text-sm resize-none placeholder-gray-400" />
            <div className={`absolute bottom-3 right-3 text-xs ${description.length > charLimit * 0.9 ? "text-red-400" : "text-gray-400"}`}>
              {description.length}/{charLimit}
            </div>
          </div>
        </Section>

        {/* ── 05 Capacity ─────────────────────────────── */}
        <Section number="05" title="Capacity & Layout" subtitle="Set guest limits and room configuration">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <Counter label="Max Guests"         value={maxGuests}       onChange={setMaxGuests}       min={1} max={20} />
              <Counter label="Base Guests (free)" value={baseGuests}      onChange={setBaseGuests}      min={1} max={maxGuests} />
              <Counter label="Beds"               value={beds}            onChange={setBeds}             min={1} max={10} />
              <Counter label="Bathrooms"          value={bathrooms}       onChange={setBathrooms}        min={1} max={10} />
            </div>
            {baseGuests > maxGuests && (
              <p className="text-red-500 text-xs mt-4 text-center">⚠️ Base guests cannot exceed max guests</p>
            )}
            <div className="flex flex-wrap gap-4 justify-center mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><FiUsers /> Max: {maxGuests} guests</span>
              <span className="flex items-center gap-1.5"><FiUsers className="text-green-500" /> Free up to: {baseGuests}</span>
              <span className="flex items-center gap-1.5"><FiDollarSign className="text-orange-400" /> ₹{extraGuestPrice}/extra guest</span>
            </div>
          </div>
        </Section>

        {/* ── 06 Amenities ────────────────────────────── */}
        <Section number="06" title="Amenities" subtitle="Select all that are available in your room">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AMENITIES.map(({ label, icon }) => {
              const selected = amenities.includes(label);
              return (
                <button key={label} type="button" onClick={() => toggleAmenity(label)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${selected
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                  <span className="text-base">{icon}</span>
                  <span className="text-left leading-tight">{label}</span>
                  {selected && <span className="ml-auto text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          {amenities.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">{amenities.length} amenit{amenities.length > 1 ? "ies" : "y"} selected</p>
          )}
        </Section>

        {/* ── Submit ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button type="submit" disabled={loading || baseGuests > maxGuests || !selectedHotelId}
            className="w-full sm:w-48 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium text-sm hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                Adding Room...
              </span>
            ) : "Add Room →"}
          </button>

          {pricePerNight && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white text-lg">
                ₹{Number(pricePerNight).toLocaleString("en-IN")}
              </span>{" "}/night
              {category && (
                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {CATEGORIES.find(c => c.label === category)?.emoji} {category}
                </span>
              )}
            </div>
          )}
        </div>

      </form>
    </div>
  );
};

export default AddRoom;