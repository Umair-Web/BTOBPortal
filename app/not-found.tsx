import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <Link
            href="/"
            className="bg-accent text-white px-6 py-3 font-medium hover:bg-accent-dark"
          >
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}

