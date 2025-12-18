import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";

const categories = ["drinkware", "electronics", "keychain", "accessories"];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idLower = id.toLowerCase();

  // Check if it's a category first
  if (categories.includes(idLower)) {
    // Render category page
    const products = await prisma.product.findMany({
      where: {
        category: idLower.charAt(0).toUpperCase() + idLower.slice(1),
      },
      orderBy: { createdAt: "desc" },
    });

    const categoryTitle =
      idLower.charAt(0).toUpperCase() + idLower.slice(1);

    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{categoryTitle}</h1>
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
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Otherwise, treat it as a product ID
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {product.images[0] && (
              <div className="aspect-square bg-gray-100 relative overflow-hidden border border-gray-200">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {product.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 relative overflow-hidden border border-gray-200"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-accent mb-6">PKR {product.price.toFixed(2)}</p>
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Category:</p>
              <p className="text-gray-600">{product.category}</p>
            </div>

            {product.stock > 0 ? (
              <p className="text-green-600 font-medium mb-6">In Stock: {product.stock} units</p>
            ) : (
              <p className="text-red-500 font-medium mb-6">Out of Stock</p>
            )}

            <AddToCartButton product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}

