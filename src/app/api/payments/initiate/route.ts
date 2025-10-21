// /api/payments/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import User, { IUser } from "@/models/User";
import Cart, { ICart } from "@/models/Cart";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = (await getUserFromApiRoute()) as {
      id: string;
      email: string;
      name: string;
    } | null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = (await User.findById(user.id)) as IUser | null;
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cart = (await Cart.findOne({
      userId: dbUser._id,
    }).lean()) as ICart | null;

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const amount = cart.items.reduce((sum: number, it) => sum + it.price, 0);

    const PAYU_KEY = process.env.PAYU_KEY!;
    const PAYU_SALT = process.env.PAYU_SALT!;
    if (!PAYU_KEY || !PAYU_SALT) {
      throw new Error("Missing PayU credentials");
    }

    const txnid = crypto.randomBytes(10).toString("hex");
    const productinfo = "CoreCap Purchase";

    const purchase = await Purchase.create({
      userId: dbUser._id,
      items: cart.items.map((it) => ({
        itemId: it.itemId,
        itemType: it.itemType,
        price: it.price,
      })),
      amount,
      status: "created",
    });

    await Payment.create({
      userId: dbUser._id,
      purchaseId: purchase._id,
      txnid,
      amount,
      status: "pending",
    });

    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${dbUser.name}|${dbUser.email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return NextResponse.json({
      success: true,
      payuParams: {
        key: PAYU_KEY,
        txnid,
        amount,
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
