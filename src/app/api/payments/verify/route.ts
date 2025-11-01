// /api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Purchase from "@/models/Purchase";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import qs from "querystring";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body: any;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = qs.parse(text);
    }

    const { txnid, status, amount, hash, email, firstname, productinfo } = body;
    if (!txnid || !status || !amount || !hash)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const PAYU_KEY = process.env.PAYU_KEY!;
    const PAYU_SALT = process.env.PAYU_SALT!;

    const hashSequence = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashSequence)
      .digest("hex");

    const payment = await Payment.findOne({ txnid });
    const purchase = await Purchase.findById(payment?.purchaseId);
    const user = await User.findById(payment?.userId);

    if (!payment || !purchase || !user)
      return NextResponse.json(
        { error: "Invalid transaction" },
        { status: 404 }
      );

    const isRedirect =
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("text/plain");

    if (calculatedHash !== hash) {
      if (isRedirect) return redirectHtml("/payment/failure");
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }

    if (status === "success") {
      payment.status = "success";
      purchase.status = "paid";

      for (const item of purchase.items) {
        if (item.itemType === "course")
          user.purchasedCourses?.push(item.itemId);
        else user.purchasedChapters?.push(item.itemId);
      }

      if (purchase.couponCode) {
        await Coupon.updateOne(
          { code: purchase.couponCode },
          { $inc: { usedCount: 1 } }
        );
      }

      await Cart.deleteOne({ userId: user._id });
    } else {
      payment.status = "failed";
      purchase.status = "failed";
    }

    payment.rawResponse = body;
    await payment.save();
    await purchase.save();
    await user.save();

    if (isRedirect) {
      return redirectHtml(
        status === "success" ? "/payment/success" : "/payment/failure"
      );
    }

    return NextResponse.json({ success: true, status: payment.status });
  } catch (err: any) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function redirectHtml(url: string) {
  const html = `
    <html><head><meta http-equiv="refresh" content="0; URL='${url}'" /></head>
    <body><script>window.location.href='${url}'</script></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
