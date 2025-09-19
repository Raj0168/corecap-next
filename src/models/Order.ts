import mongoose, { Schema, Document, models } from "mongoose";

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  itemType: "course" | "chapter";
  price: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["course", "chapter"], required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
