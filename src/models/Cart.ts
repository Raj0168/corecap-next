import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICartItem {
  itemId: Types.ObjectId;
  itemType: "course" | "chapter";
  price: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  coupon?: {
    code: string | null;
    discount: number;
  };
}

const CartItemSchema = new Schema<ICartItem>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["course", "chapter"], required: true },
    price: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [CartItemSchema],
    coupon: {
      code: { type: String, default: null },
      discount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Cart = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
