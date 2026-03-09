import nodemailer from "nodemailer";

// ✅ Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send booking confirmation email
export const sendBookingConfirmationEmail = async (booking, user, room, hotel) => {
  try {
    const checkIn = new Date(booking.checkInDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });

    const nights = Math.round(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
    );

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Outfit', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: #111827; padding: 32px 40px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 24px; margin: 0; letter-spacing: 1px; }
          .header p { color: #9ca3af; font-size: 13px; margin: 6px 0 0; }
          .body { padding: 36px 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
          .card { background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
          .card h2 { font-size: 18px; color: #111827; margin: 0 0 16px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .row:last-child { border-bottom: none; }
          .label { color: #6b7280; font-size: 13px; }
          .value { color: #111827; font-size: 13px; font-weight: 600; }
          .total-row { display: flex; justify-content: space-between; padding: 12px 0 0; }
          .total-label { font-size: 15px; font-weight: 700; color: #111827; }
          .total-value { font-size: 18px; font-weight: 700; color: #111827; }
          .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; margin-bottom: 20px; }
          .footer { background: #f9fafb; padding: 24px 40px; text-align: center; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
          .footer a { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AnumiflyStay</h1>
            <p>Your booking is confirmed ✓</p>
          </div>

          <div class="body">
            <p class="greeting">Hi <strong>${user.username || "Guest"}</strong>,<br/>
            Thank you for booking with AnumiflyStay. Your reservation is confirmed!</p>

            <span class="badge">✅ Booking Confirmed</span>

            <div class="card">
              <h2>🏨 ${hotel.name}</h2>
              <div class="row">
                <span class="label">Room Type</span>
                <span class="value">${room.roomType}</span>
              </div>
              <div class="row">
                <span class="label">Location</span>
                <span class="value">${hotel.address || hotel.city}</span>
              </div>
              <div class="row">
                <span class="label">Check-in</span>
                <span class="value">${checkIn}</span>
              </div>
              <div class="row">
                <span class="label">Check-out</span>
                <span class="value">${checkOut}</span>
              </div>
              <div class="row">
                <span class="label">Duration</span>
                <span class="value">${nights} night${nights > 1 ? "s" : ""}</span>
              </div>
              <div class="row">
                <span class="label">Guests</span>
                <span class="value">${booking.guests}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total Paid</span>
                <span class="total-value">₹${booking.totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
              If you have any questions, feel free to reply to this email.<br/>
              We hope you enjoy your stay!
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} AnumiflyStay. All rights reserved.</p>
            <p>Booking ID: <strong>${booking._id}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"AnumiflyStay" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✅ Booking Confirmed — ${hotel.name}`,
      html,
    });

    console.log("✅ Confirmation email sent to", user.email);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
   
  }
};