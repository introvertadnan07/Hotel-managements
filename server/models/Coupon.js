import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },

    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },

    discountValue: { type: Number, required: true },

    expiryDate: { type: Date, required: true },

    maxUsage: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);