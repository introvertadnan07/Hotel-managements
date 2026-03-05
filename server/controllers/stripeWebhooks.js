import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { sendInvoiceEmail } from "../utils/sendInvoiceEmail.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // 🔒 Verify Stripe Signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // MUST be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ============================================
    // ✅ CHECKOUT COMPLETED (PAYMENT SUCCESS)
    // ============================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.log("⚠️ bookingId missing in metadata");
        return res.json({ received: true });
      }

      const booking = await Booking.findById(bookingId)
        .populate("user")
        .populate("room")
        .populate("hotel");

      if (!booking) {
        console.log("⚠️ Booking not found");
        return res.json({ received: true });
      }

      // Prevent duplicate confirmation
      if (booking.status === "confirmed") {
        return res.json({ received: true });
      }

      // ✅ Update booking
      booking.isPaid = true;
      booking.status = "confirmed";
      booking.paymentMethod = "Stripe";
      booking.stripePaymentIntentId = session.payment_intent;

      await booking.save();

      console.log("✅ Booking confirmed:", bookingId);

      // ============================================
      // 📄 Generate Invoice
      // ============================================
      try {
        const invoicePath = await generateInvoicePDF(
          booking,
          booking.user,
          booking.room,
          booking.hotel
        );

        // ============================================
        // 📧 Send Email
        // ============================================
        await sendInvoiceEmail(booking.user, invoicePath);

        console.log("📧 Invoice email sent:", booking.user.email);
      } catch (mailError) {
        console.error("⚠️ Email/Invoice error:", mailError.message);
      }
    }

    // ============================================
    // 💰 REFUND COMPLETED
    // ============================================
    if (event.type === "charge.refunded") {
      const charge = event.data.object;

      const booking = await Booking.findOne({
        stripePaymentIntentId: charge.payment_intent,
      });

      if (!booking) return res.json({ received: true });

      booking.status = "refunded";
      booking.isPaid = false;

      await booking.save();

      console.log("💰 Booking refunded:", booking._id);
    }

    // ============================================
    // ❌ PAYMENT FAILED
    // ============================================
    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;

      const booking = await Booking.findOne({
        stripePaymentIntentId: intent.id,
      });

      if (booking) {
        booking.status = "cancelled";
        booking.isPaid = false;
        await booking.save();
      }

      console.log("❌ Payment failed:", intent.id);
    }

    res.json({ received: true });

  } catch (error) {
    console.error("❌ Webhook handler error:", error.message);
    res.status(500).json({ success: false });
  }
};