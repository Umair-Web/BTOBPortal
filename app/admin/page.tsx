import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";
import { DeleteProductButton } from "@/components/DeleteProductButton";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <Link
            href="/admin/products/new"
            className="bg-accent text-white px-6 py-2 font-medium hover:bg-accent-dark"
          >
            Add New Product
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-accent text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.images[0] ? (
                      <div className="w-16 h-16 bg-gray-100">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    PKR {product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-accent hover:text-accent-dark"
                    >
                      Edit
                    </Link>
                    <span className="text-gray-300">|</span>
                    <DeleteProductButton productId={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

