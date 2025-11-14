export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: body.userId,
      },
    });

    if (!user) {
      return NextResponse.json({
        message: "User not found!",
      });
    }

    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": process.env.CASHFREE_CLIENT_ID as string,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET as string,
      },
      body: JSON.stringify({
        customer_details: {
          customer_id: user.id,
          customer_phone: user.phoneNumber,
          bookingId: body.bookingId,
          eventId: body.eventId,
          amount: body.amount,
        },
        order_id: body.bookingId,
        order_amount: body.amount,
        order_currency: "INR",
        order_meta: {
          notify_url: process.env.CASHFREE_WEBHOOK_URL,
          payment_methods: "cc,dc,upi",
        },
      }),
    });

    console.log(response);

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree Error:", data);
      return NextResponse.json(
        { message: data.message || "Failed to create order" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in /initiate-payment:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}
