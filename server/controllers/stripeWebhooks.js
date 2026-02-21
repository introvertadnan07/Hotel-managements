import Stripe from "stripe";
import Booking from "../models/Booking.js";

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

  //
  // ✅ HANDLE EVENTS (OUTSIDE CATCH)
  //
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.log("⚠️ No bookingId in metadata");
        return response.json({ received: true });
      }

      console.log("✅ Payment success for booking:", bookingId);

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
      });
    } else {
      console.log("Unhandled event type:", event.type);
    }

    response.json({ received: true });

  } catch (error) {
    console.error("❌ Webhook handler error:", error.message);
    response.status(500).json({ success: false });
  }
};