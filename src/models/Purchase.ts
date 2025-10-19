import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface IPurchaseItem {
  itemId: Types.ObjectId;
  itemType: "course" | "chapter";
  price: number;
}

export interface IPurchase extends Document {
  userId: Types.ObjectId;
  items: IPurchaseItem[];
  amount: number;
  status: "created" | "paid" | "failed";
  paymentProvider?: string;
  providerPaymentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["course", "chapter"], required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [PurchaseItemSchema], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    paymentProvider: { type: String },
    providerPaymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Purchase =
  models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);
export default Purchase;
