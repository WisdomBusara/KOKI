"use server";

import { redirect } from "next/navigation";
import slugify from "slugify";
import { createProductDoc, updateProductDoc, deleteProductDoc, type ProductInput } from "@/lib/admin";
import { CATEGORIES, type Category } from "@/types";

export type ProductFormState = { error?: string };

const CATEGORY_SET = new Set<string>(CATEGORIES.map((c) => c.value));

function parse(formData: FormData): ProductInput | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "");
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  if (!name) return { error: "Name is required." };
  if (!CATEGORY_SET.has(categoryRaw)) return { error: "Choose a valid category." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be zero or more." };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Stock must be zero or more." };

  const str = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v.length ? v : null;
  };

  return {
    name,
    slug: slugify(name, { lower: true, strict: true }),
    category: categoryRaw as Category,
    price: Math.round(price),
    stock: Math.floor(stock),
    description: str("description"),
    imageUrl: str("imageUrl"),
    field1: str("field1"),
    field2: str("field2"),
    field3: str("field3"),
    featured: formData.get("featured") === "on",
  };
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;
  try {
    await createProductDoc(parsed);
  } catch (err) {
    if (err instanceof Error && err.message.includes("E11000")) {
      return { error: "A product with a similar name already exists." };
    }
    throw err;
  }
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;
  try {
    await updateProductDoc(id, parsed);
  } catch (err) {
    if (err instanceof Error && err.message.includes("E11000")) {
      return { error: "A product with a similar name already exists." };
    }
    throw err;
  }
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteProductDoc(id);
  redirect("/admin/products");
}
