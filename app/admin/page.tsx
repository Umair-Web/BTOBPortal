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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-600">
              Manage products, pricing, and inventory.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            Add new product
          </Link>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Image</th>
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Category</th>
                <th className="px-6 py-3 text-left font-medium">Price</th>
                <th className="px-6 py-3 text-left font-medium">Stock</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.images[0] ? (
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    PKR {product.price.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-slate-900 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No products found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

