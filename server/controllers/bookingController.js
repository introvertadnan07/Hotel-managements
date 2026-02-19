import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// 🔹 Check availability helper
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  const bookings = await Booking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate },
  });

  return bookings.length === 0;
};

// ✅ Availability API
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    if (!room || !checkInDate || !checkOutDate) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn) || isNaN(checkOut)) {
      return res.json({
        success: false,
        message: "Invalid dates",
      });
    }

    const isAvailable = await checkAvailability({
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });

    res.json({ success: true, isAvailable });

  } catch (error) {
    console.error("Availability error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Create booking
export const createBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { room, checkInDate, checkOutDate, guests } = req.body;

    if (!room || !checkInDate || !checkOutDate) {
      return res.json({
        success: false,
        message: "Missing booking details",
      });
    }

    if (!guests || guests < 1) {
      return res.json({
        success: false,
        message: "Invalid guests count",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn) || isNaN(checkOut)) {
      return res.json({
        success: false,
        message: "Invalid dates",
      });
    }

    const nights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      return res.json({
        success: false,
        message: "Invalid booking duration",
      });
    }

    const userId = req.user._id;

    // 🔹 Check availability
    const isAvailable = await checkAvailability({
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room not available",
      });
    }

    // 🔹 Fetch room + hotel
    const roomData = await Room.findById(room).populate("hotel");

    if (!roomData) {
      return res.json({
        success: false,
        message: "Room not found",
      });
    }

    const totalPrice = roomData.pricePerNight * nights;

    // ✅ Save booking
    const booking = await Booking.create({
      user: userId,
      room,
      hotel: roomData.hotel._id,
      guests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
    });

    // ✅ Send confirmation email
    const userData = req.user;

    if (!userData?.email) {
      console.log("⚠️ No user email found. Skipping email.");
    } else {
      const mailOptions = {
        from: `"QuickStay" <${process.env.SENDER_EMAIL}>`,
        to: userData.email,
        subject: "Booking Confirmation – QuickStay",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4f46e5;">Booking Confirmed 🎉</h2>

            <p>Hi <strong>${userData.username || "Guest"}</strong>,</p>

            <p>Your booking has been successfully confirmed. Here are your details:</p>

            <table style="border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td><strong>Booking ID:</strong></td>
                <td>${booking._id}</td>
              </tr>
              <tr>
                <td><strong>Hotel:</strong></td>
                <td>${roomData.hotel?.name}</td>
              </tr>
              <tr>
                <td><strong>Location:</strong></td>
                <td>${roomData.hotel?.address}</td>
              </tr>
              <tr>
                <td><strong>Check-In:</strong></td>
                <td>${checkIn.toDateString()}</td>
              </tr>
              <tr>
                <td><strong>Check-Out:</strong></td>
                <td>${checkOut.toDateString()}</td>
              </tr>
              <tr>
                <td><strong>Guests:</strong></td>
                <td>${guests}</td>
              </tr>
              <tr>
                <td><strong>Total Amount:</strong></td>
                <td>${process.env.CURRENCY || "₹"} ${booking.totalPrice.toLocaleString()}</td>
              </tr>
            </table>

            <p style="margin-top: 15px;">
              We look forward to welcoming you ✨
            </p>

            <p>Regards,<br/><strong>QuickStay Team</strong></p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent ✅", info.response);
      } catch (mailError) {
        console.error("Email failed ❌:", mailError.message);
      }
    }

    res.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });

  } catch (error) {
    console.error("Create booking error:", error.message);
    res.json({
      success: false,
      message: "Booking failed",
    });
  }
};

// ✅ User bookings
export const getUserBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bookings = await Booking.find({ user: req.user._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (error) {
    console.error("User bookings error:", error.message);
    res.json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ✅ Hotel Owner Dashboard
export const getHotelBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const hotel = await Hotel.findOne({ owner: req.user.clerkId });

    if (!hotel) {
      return res.json({
        success: true,
        dashboardData: {
          bookings: [],
          totalBookings: 0,
          totalRevenue: 0,
        },
      });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: {
        bookings,
        totalBookings,
        totalRevenue,
      },
    });

  } catch (error) {
    console.error("Hotel bookings error:", error.message);
    res.json({
      success: false,
      message: "Failed to fetch hotel bookings",
    });
  }
};
