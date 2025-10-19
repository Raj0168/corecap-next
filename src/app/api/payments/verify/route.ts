import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Purchase from "@/models/Purchase";
import User from "@/models/User";
import Cart from "@/models/Cart";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { txnid, status, amount, hash, email, firstname, productinfo } = body;
    if (!txnid || !status || !amount || !hash)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const PAYU_KEY = process.env.PAYU_KEY!;
    const PAYU_SALT = process.env.PAYU_SALT!;

    // Recalculate hash (reverse order for response)
    const hashSequence = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashSequence)
      .digest("hex");

    if (calculatedHash !== hash)
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });

    const payment = await Payment.findOne({ txnid });
    if (!payment)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const purchase = await Purchase.findById(payment.purchaseId);
    if (!purchase)
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );

    const user = await User.findById(payment.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (status === "success") {
      payment.status = "success";
      purchase.status = "paid";

      // Grant access
      for (const item of purchase.items) {
        if (item.itemType === "course") {
          user.purchasedCourses?.push(item.itemId);
        } else {
          user.purchasedChapters?.push(item.itemId);
        }
      }

      // Clear cart
      await Cart.deleteOne({ userId: user._id });
    } else {
      payment.status = "failed";
      purchase.status = "failed";
    }

    payment.rawResponse = body;
    await payment.save();
    await purchase.save();
    await user.save();

    return NextResponse.json({ success: true, status: payment.status });
  } catch (err: any) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
