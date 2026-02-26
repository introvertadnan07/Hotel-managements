import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = (booking, user, room) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      const fileName = `invoice-${booking._id}.pdf`;
      const filePath = path.join("uploads", fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===== HEADER =====
      doc
        .fontSize(22)
        .fillColor("#1e293b")
        .text("Anumifly Hotel Invoice", { align: "center" })
        .moveDown();

      doc
        .fontSize(10)
        .fillColor("#64748b")
        .text(`Invoice ID: ${booking._id}`)
        .text(`Date: ${new Date().toLocaleDateString()}`)
        .moveDown(2);

      // ===== CUSTOMER DETAILS =====
      doc
        .fontSize(14)
        .fillColor("#000")
        .text("Billed To:")
        .fontSize(12)
        .text(user.username)
        .text(user.email)
        .moveDown(2);

      // ===== BOOKING DETAILS =====
      doc
        .fontSize(14)
        .text("Booking Details")
        .moveDown();

      doc
        .fontSize(12)
        .text(`Room Type: ${room.roomType}`)
        .text(`Check-in: ${booking.checkInDate}`)
        .text(`Check-out: ${booking.checkOutDate}`)
        .text(`Guests: ${booking.guests}`)
        .moveDown(2);

      // ===== PRICE TABLE =====
      doc
        .fontSize(14)
        .text("Payment Summary")
        .moveDown();

      doc
        .fontSize(12)
        .text(`Total Amount: ₹${booking.totalPrice}`)
        .moveDown(2);

      doc
        .fillColor("#16a34a")
        .fontSize(12)
        .text("Payment Status: Paid");

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};