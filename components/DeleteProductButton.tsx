"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteProductButtonProps {
  productId: string;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}

