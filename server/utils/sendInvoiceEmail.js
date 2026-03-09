import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Premium Invoice Email
export const sendInvoiceEmail = async (user, invoiceBuffer, booking, room, hotel) => {
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
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:Georgia,serif;">

      <!-- Outer wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

            <!-- Gold Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2415 50%,#1a1a1a 100%);padding:48px 40px;text-align:center;border-bottom:1px solid #c9a84c;">
                <p style="color:#c9a84c;font-size:11px;letter-spacing:6px;margin:0 0 12px;text-transform:uppercase;">Luxury Collection</p>
                <h1 style="color:#f5e6c8;font-size:32px;margin:0;letter-spacing:3px;font-weight:400;">AnumiflyStay</h1>
                <div style="width:60px;height:1px;background:#c9a84c;margin:16px auto;"></div>
                <p style="color:#9a7d4a;font-size:12px;letter-spacing:4px;margin:0;text-transform:uppercase;">Booking Confirmed</p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:36px 40px 0;">
                <p style="color:#e8d5a3;font-size:16px;margin:0 0 8px;">Dear <strong style="color:#f5e6c8;">${user.username || "Valued Guest"}</strong>,</p>
                <p style="color:#8a8a8a;font-size:14px;line-height:1.7;margin:0;">
                  We are delighted to confirm your reservation at <strong style="color:#c9a84c;">${hotel?.name || "our property"}</strong>.
                  Your journey to luxury begins here. Please find your invoice attached to this email.
                </p>
              </td>
            </tr>

            <!-- Booking Details Card -->
            <tr>
              <td style="padding:28px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;border:1px solid #2a2a2a;overflow:hidden;">

                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid #2a2a2a;">
                      <p style="color:#c9a84c;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0;">Reservation Details</p>
                    </td>
                  </tr>

                  <!-- Hotel -->
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #1e1e1e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#6a6a6a;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:40%;">Property</td>
                          <td style="color:#f5e6c8;font-size:13px;text-align:right;">${hotel?.name || "—"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Room -->
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #1e1e1e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#6a6a6a;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:40%;">Room Type</td>
                          <td style="color:#f5e6c8;font-size:13px;text-align:right;">${room?.roomType || "—"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Check In -->
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #1e1e1e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#6a6a6a;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:40%;">Check-In</td>
                          <td style="color:#f5e6c8;font-size:13px;text-align:right;">${checkIn}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Check Out -->
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #1e1e1e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#6a6a6a;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:40%;">Check-Out</td>
                          <td style="color:#f5e6c8;font-size:13px;text-align:right;">${checkOut}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Duration -->
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #1e1e1e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#6a6a6a;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:40%;">Duration</td>
                          <td style="color:#f5e6c8;font-size:13px;text-align:right;">${nights} Night${nights > 1 ? "s" : ""}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Guests -->
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #1e1e1e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#6a6a6a;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:40%;">Guests</td>
                          <td style="color:#f5e6c8;font-size:13px;text-align:right;">${booking.guests}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Total -->
                  <tr>
                    <td style="padding:20px 24px;background:linear-gradient(135deg,#1a1500,#2d2415);">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Total Amount Paid</td>
                          <td style="color:#f5e6c8;font-size:22px;font-weight:bold;text-align:right;">₹${booking.totalPrice?.toLocaleString("en-IN")}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Invoice Note -->
            <tr>
              <td style="padding:0 40px 28px;">
                <p style="color:#5a5a5a;font-size:12px;line-height:1.7;margin:0;text-align:center;">
                  📎 Your detailed invoice is attached to this email as a PDF.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <div style="height:1px;background:linear-gradient(to right,transparent,#c9a84c,transparent);"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:28px 40px;text-align:center;">
                <p style="color:#4a4a4a;font-size:11px;margin:0 0 6px;letter-spacing:1px;">We look forward to welcoming you.</p>
                <p style="color:#c9a84c;font-size:11px;margin:0;letter-spacing:2px;text-transform:uppercase;">AnumiflyStay · Luxury Hospitality</p>
                <p style="color:#3a3a3a;font-size:10px;margin:12px 0 0;">Booking ID: ${booking._id}</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"AnumiflyStay" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `✨ Your Booking is Confirmed — ${hotel?.name || "AnumiflyStay"}`,
    html,
    attachments: [
      {
        filename: `invoice-${booking._id}.pdf`,
        content: invoiceBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log("📧 Premium invoice email sent to:", user.email);
};