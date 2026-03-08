import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = (booking, user, room) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Make sure uploads folder exists
      if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads", { recursive: true });
      }

      const fileName = `invoice-${booking._id}.pdf`;
      const filePath = path.join("uploads", fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── HEADER ────────────────────────────────────────────
      doc
        .fontSize(24)
        .fillColor("#1e293b")
        .text("Anumifly", { align: "center" })
        .fontSize(12)
        .fillColor("#64748b")
        .text("Hotel Booking Invoice", { align: "center" })
        .moveDown(0.5);

      // Divider
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#e2e8f0")
        .stroke()
        .moveDown(1);

      // ── INVOICE META ──────────────────────────────────────
      doc
        .fontSize(10)
        .fillColor("#64748b")
        .text(`Invoice ID: ${booking._id}`)
        .text(`Date Issued: ${new Date().toLocaleDateString("en-IN", {
          year: "numeric", month: "long", day: "numeric"
        })}`)
        .moveDown(1.5);

      // ── BILLED TO ─────────────────────────────────────────
      doc
        .fontSize(12)
        .fillColor("#1e293b")
        .text("Billed To:", { underline: true })
        .moveDown(0.3)
        .fontSize(11)
        .fillColor("#334155")
        .text(user.username || "Guest")
        .text(user.email || "")
        .moveDown(1.5);

      // ── BOOKING DETAILS ───────────────────────────────────
      doc
        .fontSize(12)
        .fillColor("#1e293b")
        .text("Booking Details:", { underline: true })
        .moveDown(0.3);

      const details = [
        ["Hotel", booking.hotel?.name || "—"],
        ["Room Type", room?.roomType || "—"],
        ["Check-In", new Date(booking.checkInDate).toDateString()],
        ["Check-Out", new Date(booking.checkOutDate).toDateString()],
        ["Guests", String(booking.guests || 1)],
        ["Booking Status", booking.status || "confirmed"],
      ];

      details.forEach(([label, value]) => {
        doc
          .fontSize(10)
          .fillColor("#64748b")
          .text(`${label}:`, { continued: true, width: 150 })
          .fillColor("#1e293b")
          .text(` ${value}`);
      });

      doc.moveDown(1.5);

      // ── PAYMENT SUMMARY ───────────────────────────────────
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#e2e8f0")
        .stroke()
        .moveDown(0.8);

      doc
        .fontSize(12)
        .fillColor("#1e293b")
        .text("Payment Summary:", { underline: true })
        .moveDown(0.5);

      const nights = Math.round(
        (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
        (1000 * 60 * 60 * 24)
      );

      doc
        .fontSize(10)
        .fillColor("#64748b")
        .text(`Room Rate:`, { continued: true, width: 150 })
        .fillColor("#1e293b")
        .text(` ₹${(room?.pricePerNight || 0).toLocaleString()} / night`);

      doc
        .fillColor("#64748b")
        .text(`Nights:`, { continued: true, width: 150 })
        .fillColor("#1e293b")
        .text(` ${nights}`);

      doc.moveDown(0.5);

      // Total box
      doc
        .rect(350, doc.y, 200, 36)
        .fillColor("#f0fdf4")
        .fill();

      doc
        .fontSize(13)
        .fillColor("#16a34a")
        .text(
          `Total: ₹${Number(booking.totalPrice).toLocaleString()}`,
          355,
          doc.y - 28,
          { width: 190, align: "center" }
        );

      doc.moveDown(2.5);

      // ── PAYMENT STATUS ────────────────────────────────────
      doc
        .fontSize(11)
        .fillColor("#16a34a")
        .text("✓ Payment Confirmed", { align: "center" })
        .moveDown(0.5);

      // ── FOOTER ────────────────────────────────────────────
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#e2e8f0")
        .stroke()
        .moveDown(0.8);

      doc
        .fontSize(9)
        .fillColor("#94a3b8")
        .text("Thank you for choosing Anumifly. For support, contact us at support@anumifly.com", {
          align: "center"
        });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);

    } catch (error) {
      reject(error);
    }
  });
};