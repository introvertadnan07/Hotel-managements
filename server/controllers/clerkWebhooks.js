import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  console.log("🚀 Clerk Webhook HIT");

  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // ✅ Verify webhook
    const evt = whook.verify(JSON.stringify(req.body), headers);

    const { data, type } = evt;

    console.log("📩 Webhook type:", type);

    // ✅ Extract PRIMARY email safely
    const primaryEmail = data.email_addresses?.find(
      (email) => email.id === data.primary_email_address_id
    );

    if (!primaryEmail?.email_address) {
      throw new Error("No primary email found in Clerk webhook");
    }

    const userData = {
      clerkId: data.id,
      email: primaryEmail.email_address,
      username:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
      image: data.image_url,
    };

    switch (type) {
      case "user.created":
      case "user.updated":
        console.log("✅ Creating / Updating user");
        await User.findOneAndUpdate(
          { clerkId: data.id },
          userData,
          { upsert: true, new: true }
        );
        break;

      case "user.deleted":
        console.log("🗑 Deleting user");
        await User.findOneAndDelete({ clerkId: data.id });
        break;

      default:
        console.log("⚠️ Unhandled webhook:", type);
        break;
    }

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Webhook error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default clerkWebhooks;
