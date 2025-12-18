import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to B2B Portal</h1>
          <p className="text-lg text-gray-600">
            Browse our products and generate quotations for your business needs.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
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
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/products"
            className="bg-accent text-white p-6 hover:bg-accent-dark transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">All Products</h3>
            <p className="text-sm">View our complete catalog</p>
          </Link>
          <Link
            href="/products/drinkware"
            className="bg-accent text-white p-6 hover:bg-accent-dark transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Drinkware</h3>
            <p className="text-sm">Browse drinkware collection</p>
          </Link>
          <Link
            href="/products/electronics"
            className="bg-accent text-white p-6 hover:bg-accent-dark transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Electronics</h3>
            <p className="text-sm">Explore electronic items</p>
          </Link>
        

          
          <Link
            href="/products/accessories"
            className="bg-accent text-white p-6 hover:bg-accent-dark transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Accessories</h3>
            <p className="text-sm">Check out accessories</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

