import nodemailer from "nodemailer";
import fs from "fs";

export const sendInvoiceEmail = async (user, invoicePath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Anumifly" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your Booking Invoice - Anumifly",
    html: `
      <h2>Thank you for your booking!</h2>
      <p>Please find your invoice attached.</p>
      <p>We look forward to hosting you again.</p>
    `,
    attachments: [
      {
        filename: "invoice.pdf",
        path: invoicePath,
      },
    ],
  });
};