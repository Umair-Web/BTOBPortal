import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="border border-gray-200 bg-white hover:border-accent transition-colors"
            >
              {product.images[0] && (
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-xl font-bold text-accent">PKR {product.price.toFixed(2)}</p>
                {product.stock > 0 ? (
                  <p className="text-sm text-gray-500 mt-2">In Stock: {product.stock}</p>
                ) : (
                  <p className="text-sm text-red-500 mt-2">Out of Stock</p>
                )}
              </div>
            </Link>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

