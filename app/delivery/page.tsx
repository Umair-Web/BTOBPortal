import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DeliveryUpdateForm } from "@/components/DeliveryUpdateForm";
import { formatDate } from "@/lib/utils";
import { DeliveryStatus } from "@prisma/client";

const statusLabels: Record<DeliveryStatus, string> = {
  NOT_STARTED: "Not Started",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const statusColors: Record<DeliveryStatus, string> = {
  NOT_STARTED: "bg-gray-200 text-gray-800",
  PENDING: "bg-yellow-200 text-yellow-800",
  IN_PROGRESS: "bg-blue-200 text-blue-800",
  COMPLETED: "bg-green-200 text-green-800",
};

export default async function DeliveryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.DELIVERY) {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Delivery Management</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 bg-white p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Customer: {order.user.email} | {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="border-l-4 border-accent pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × PKR {item.price.toFixed(2)}
                          </p>
                          {item.colorVariant && (
                            <p className="text-sm text-gray-600">
                              Color: {item.colorVariant}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-medium ${statusColors[item.deliveryStatus]}`}
                        >
                          {statusLabels[item.deliveryStatus]}
                        </span>
                      </div>
                      {item.deliveryComments && (
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Delivery Comments:
                          </p>
                          <p className="text-sm text-gray-600">{item.deliveryComments}</p>
                        </div>
                      )}
                      <div className="mt-3">
                        <DeliveryUpdateForm orderItem={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

