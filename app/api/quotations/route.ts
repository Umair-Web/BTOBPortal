import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quotationNumber, items, totalAmount } = body;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        userId: session.user.id,
        items: items,
        totalAmount,
      },
    });

    return NextResponse.json(quotation);
  } catch (error: any) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create quotation" },
      { status: 500 }
    );
  }
}

