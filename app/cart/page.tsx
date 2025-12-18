"use client";

import { Navbar } from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { GenerateQuotationButton } from "@/components/GenerateQuotationButton";
import { PlaceOrderButton } from "@/components/PlaceOrderButton";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link
              href="/products"
              className="bg-accent text-white px-6 py-3 font-medium hover:bg-accent-dark"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.colorVariant}`}
                className="border border-gray-200 p-4 bg-white"
              >
                <div className="flex gap-4">
                  {item.image && (
                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Color: {item.colorVariant}</p>
                    <p className="text-xl font-bold text-accent mt-2">
                      PKR {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-gray-300">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.colorVariant, item.quantity - 1)
                        }
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.colorVariant, item.quantity + 1)
                        }
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-lg font-semibold">
                      PKR {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId, item.colorVariant)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="border border-gray-200 p-6 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">PKR {getTotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-accent">PKR {getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <GenerateQuotationButton items={items} />
                <PlaceOrderButton items={items} total={getTotal()} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

