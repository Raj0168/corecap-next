import mongoose, { Schema, Document, models } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  purpose: "verify_email" | "reset_password";
  expiresAt: Date;
  consumed: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["verify_email", "reset_password"],
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    consumed: { type: Boolean, default: false },
    data: { type: Object },
  },
  { timestamps: true }
);

// Auto-clean expired
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;
