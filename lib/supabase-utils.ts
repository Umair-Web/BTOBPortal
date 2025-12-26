import { supabase } from "@/lib/supabase";

/**
 * Extract file path from Supabase storage URL
 * Example: https://abgjjmonesyimmbwbekj.supabase.co/storage/v1/object/public/product-images/products/1766749169758-hmzjijjure.png
 * Returns: products/1766749169758-hmzjijjure.png
 */
export function extractFilePathFromUrl(url:  string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/public/product-images/");
    return pathParts[1] || null;
  } catch {
    return null;
  }
}

/**
 * Delete an image from Supabase storage
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  const filePath = extractFilePathFromUrl(imageUrl);
  
  if (!filePath) {
    console.error("Invalid image URL:", imageUrl);
    return false;
  }

  const { error } = await supabase.storage
    .from("product-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image from storage:", error);
    return false;
  }

  return true;
}

/**
 * Delete multiple images from Supabase storage
 */
export async function deleteImagesFromStorage(imageUrls:  string[]): Promise<void> {
  const filePaths = imageUrls
    .map(url => extractFilePathFromUrl(url))
    .filter((path): path is string => path !== null);

  if (filePaths.length === 0) return;

  const { error } = await supabase.storage
    .from("product-images")
    .remove(filePaths);

  if (error) {
    console.error("Error deleting images from storage:", error);
  }
}