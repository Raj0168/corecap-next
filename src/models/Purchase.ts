import mongoose, { Schema, Document, models } from "mongoose";

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  amount: number;
  status: "created" | "paid" | "failed" | "refunded";
  paymentProvider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    paymentProvider: String,
    providerOrderId: String,
    providerPaymentId: String,
  },
  { timestamps: true }
);

export const Purchase =
  models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);
export default Purchase;
