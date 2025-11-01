import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import User from "@/models/User";
import Cart, { ICart } from "@/models/Cart";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";

export async function POST(req: NextRequest) {
try {
  await connectDB();

  const user = await getUserFromApiRoute();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await User.findById(user.id);
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cart = (await Cart.findOne({
    userId: dbUser._id,
  }).lean()) as ICart | null;

  if (!cart || !cart.items?.length)
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const total = cart.items.reduce((sum, item) => sum + item.price, 0);

  const discount = cart.coupon?.discount ?? 0;
  const finalAmount = Math.max(total - discount, 0);

  const PAYU_KEY = process.env.PAYU_KEY!;
  const PAYU_SALT = process.env.PAYU_SALT!;
  if (!PAYU_KEY || !PAYU_SALT) throw new Error("Missing PayU credentials");

  const txnid = crypto.randomBytes(10).toString("hex");
  const productinfo = "CoreCap Purchase";

  const purchase = await Purchase.create({
    userId: dbUser._id,
    items: cart.items,
    amount: finalAmount,
    originalAmount: total,
    discount,
    couponCode: cart.coupon?.code ?? null,
    status: "created",
  });

  await Payment.create({
    userId: dbUser._id,
    purchaseId: purchase._id,
    txnid,
    amount: finalAmount,
    status: "pending",
  });

  const hashString = `${PAYU_KEY}|${txnid}|${finalAmount}|${productinfo}|${dbUser.name}|${dbUser.email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  return NextResponse.json({
    success: true,
    payuParams: {
      key: PAYU_KEY,
      txnid,
      amount: finalAmount,
      productinfo,
      firstname: dbUser.name,
      email: dbUser.email,
      phone: "9999999999",
      surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/verify`,
      furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/verify`,
      hash,
    },
  });
} catch (err: any) {
  console.error("INITIATE PAYMENT ERROR:", err);
  return NextResponse.json({ error: err.message }, { status: 500 });
}
}
