import Stripe from "stripe";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { sendInvoiceEmail } from "../utils/sendInvoiceEmail.js";

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.log("⚠️ No bookingId in metadata");
        return response.json({ received: true });
      }

      console.log("✅ Payment success for booking:", bookingId);

      const booking = await Booking.findById(bookingId)
        .populate("user")
        .populate("room");

      if (!booking) return response.json({ received: true });

      booking.isPaid = true;
      booking.paymentMethod = "Stripe";
      await booking.save();

      // ✅ Generate Invoice
      const invoicePath = await generateInvoicePDF(
        booking,
        booking.user,
        booking.room
      );

      // ✅ Send Email
      await sendInvoiceEmail(booking.user, invoicePath);
    }

    response.json({ received: true });

  } catch (error) {
    console.error("❌ Webhook handler error:", error.message);
    response.status(500).json({ success: false });
  }
};