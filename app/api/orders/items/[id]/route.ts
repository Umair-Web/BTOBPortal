import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, DeliveryStatus } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.DELIVERY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { deliveryStatus, deliveryComments } = body;

    const orderItem = await prisma.orderItem.update({
      where: { id },
      data: {
        deliveryStatus: deliveryStatus as DeliveryStatus,
        deliveryComments: deliveryComments || null,
      },
    });

    return NextResponse.json(orderItem);
  } catch (error: any) {
    console.error("Error updating order item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order item" },
      { status: 500 }
    );
  }
}

