import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountAmount: number;
  minAmount: number;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, unique: true, required: true },
    discountAmount: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    maxUses: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;
