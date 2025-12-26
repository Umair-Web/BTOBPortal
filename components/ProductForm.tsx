"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be non-negative"),
  category: z.enum(["Drinkware", "Electronics", "Keychain", "Accessories"]),
  images: z.array(z.string()).min(1, "At least one image is required"),
  colorVariants: z.array(z.string()).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
}

interface LocalImage {
  file?:  File;
  url:  string;
  isExisting:  boolean;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [localImages, setLocalImages] = useState<LocalImage[]>(
    product?.images?. map((url) => ({ url, isExisting: true })) || []
  );
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]); // Track removed images
  const [colorVariants, setColorVariants] = useState<string[]>(
    product?.colorVariants || []
  );
  const [newColor, setNewColor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState:  { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category as any,
          images: product.images,
          colorVariants: product. colorVariants,
        }
      : undefined,
  });

  useEffect(() => {
    const imageUrls = localImages.map((img) => img.url);
    setValue("images", imageUrls);
  }, [localImages, setValue]);

  useEffect(() => {
    setValue("colorVariants", colorVariants);
  }, [colorVariants, setValue]);

  useEffect(() => {
    return () => {
      localImages.forEach((img) => {
        if (! img.isExisting && img.url. startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleImageSelect = (e: React. ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (! files || files.length === 0) return;

    setError("");

    try {
      const newImages:  LocalImage[] = [];

      for (const file of Array.from(files)) {
        if (! file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Image size must be under 5MB");
        }

        const blobUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          url: blobUrl,
          isExisting: false,
        });
      }

      setLocalImages((prev) => [...prev, ...newImages]);
    } catch (err:  any) {
      console.error(err);
      setError(err.message || "Image selection failed");
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = localImages[index];
    
    // If it's an existing image, track it for deletion
    if (imageToRemove.isExisting) {
      setRemovedImageUrls((prev) => [...prev, imageToRemove.url]);
    } else if (imageToRemove.url. startsWith("blob:")) {
      // Revoke blob URL to free memory
      URL.revokeObjectURL(imageToRemove.url);
    }

    setLocalImages(localImages.filter((_, i) => i !== index));
  };

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const localImage of localImages) {
      if (localImage.isExisting) {
        uploadedUrls.push(localImage.url);
      } else if (localImage.file) {
        const file = localImage.file;
        const fileExt = file.name.split(". ").pop();
        const fileName = `products/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(error);
          throw new Error(`Failed to upload image: ${file.name}`);
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const getFilePathFromUrl = (url: string): string | null => {
    try {
      // Extract the file path from the public URL
      // Example URL: https://xxx.supabase.co/storage/v1/object/public/product-images/products/filename.jpg
      const urlParts = url.split('/product-images/');
      if (urlParts.length === 2) {
        return urlParts[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const deleteImagesFromSupabase = async (imageUrls: string[]) => {
    const filePaths: string[] = [];
    
    for (const url of imageUrls) {
      const filePath = getFilePathFromUrl(url);
      if (filePath) {
        filePaths.push(filePath);
      }
    }

    if (filePaths.length > 0) {
      const { error } = await supabase.storage
        .from('product-images')
        .remove(filePaths);

      if (error) {
        console.error('Failed to delete images from storage:', error);
        throw new Error('Failed to delete images from storage');
      }
    }
  };

  const addColorVariant = () => {
    if (newColor.trim() && !colorVariants.includes(newColor. trim())) {
      setColorVariants([...colorVariants, newColor.trim()]);
      setNewColor("");
    }
  };

  const removeColorVariant = (color: string) => {
    setColorVariants(colorVariants.filter((c) => c !== color));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Delete removed images from Supabase Storage FIRST
      if (removedImageUrls.length > 0) {
        await deleteImagesFromSupabase(removedImageUrls);
      }

      // Upload new images to Supabase
      const uploadedImageUrls = await uploadImagesToSupabase();

      // Create/update the product
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ... data,
          images: uploadedImageUrls,
          colorVariants: colorVariants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      // Cleanup blob URLs
      localImages.forEach((img) => {
        if (! img.isExisting && img. url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name *
        </label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-md"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock *
          </label>
          <input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          {...register("category")}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
        >
          <option value="Drinkware">Drinkware</option>
          <option value="Electronics">Electronics</option>
          <option value="Keychain">Keychain</option>
          <option value="Accessories">Accessories</option>
        </select>
        {errors. category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images * (Select files - will be uploaded when you submit)
        </label>

        <div className="mb-4">
          <label className="block">
            <span className="sr-only">Choose image files</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isSubmitting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            />
          </label>
        </div>

        {localImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {localImages.map((img, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 border border-gray-300 overflow-hidden rounded">
                  <img
                    src={img. url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {img.isExisting && (
                  <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Uploaded
                  </span>
                )}
                {! img.isExisting && (
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
        )}
        {localImages.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Select at least one image for the product
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Variants
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColorVariant();
              }
            }}
            placeholder="Enter color name"
            className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          />
          <button
            type="button"
            onClick={addColorVariant}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-full"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorVariants.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-full"
            >
              {color}
              <button
                type="button"
                onClick={() => removeColorVariant(color)}
                className="hover:text-gray-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-accent text-white hover:bg-accent-dark disabled:opacity-50 rounded-full"
        >
          {isSubmitting
            ? "Uploading and saving..."
            : product
            ? "Update Product"
            :  "Create Product"}
        </button>
      </div>
    </form>
  );
}