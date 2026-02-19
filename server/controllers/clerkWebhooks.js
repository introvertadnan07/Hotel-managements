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

    await whook.verify(JSON.stringify(req.body), headers);

    const { data, type } = req.body;

    if (!data.email_addresses?.length) {
      throw new Error("No email found in Clerk webhook");
    }

    const userData = {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
    };

    switch (type) {
      case "user.created":
        await User.findOneAndUpdate(
          { clerkId: data.id },
          userData,
          { upsert: true, new: true }
        );
        break;

      case "user.updated":
        await User.findOneAndUpdate(
          { clerkId: data.id },
          userData,
          { new: true }
        );
        break;

      case "user.deleted":
        await User.findOneAndDelete({ clerkId: data.id });
        break;

      default:
        break;
    }

    res.json({ success: true, message: "Webhook received" });

  } catch (error) {
    console.error("Webhook error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
