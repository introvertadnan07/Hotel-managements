import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//
// ✅ GET DASHBOARD STATS
//
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalBookings, totalHotels, totalRooms] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Hotel.countDocuments(),
      Room.countDocuments(),
    ]);

    const revenueData = await Booking.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate("user", "username email image")
      .populate("hotel", "name")
      .populate("room", "roomType")
      .sort({ createdAt: -1 })
      .limit(5);

    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        totalHotels,
        totalRooms,
        totalRevenue,
        monthlyRevenue,
        recentBookings,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ GET ALL USERS
//
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ UPDATE USER ROLE
//
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!["user", "hotelOwner", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ DELETE USER
//
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ GET ALL BOOKINGS
//
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email image")
      .populate("hotel", "name address")
      .populate("room", "roomType pricePerNight")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ UPDATE BOOKING STATUS
//
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ GET ALL HOTELS
//
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("owner", "username email")
      .sort({ createdAt: -1 });
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ DELETE HOTEL
//
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });
    // Also delete rooms of that hotel
    await Room.deleteMany({ hotel: req.params.id });
    res.json({ success: true, message: "Hotel and its rooms deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// ✅ TOGGLE HOTEL VERIFIED
//
export const toggleHotelVerified = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });
    hotel.isVerified = !hotel.isVerified;
    await hotel.save();
    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};