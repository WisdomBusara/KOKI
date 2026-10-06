import "server-only";
import { Types } from "mongoose";
import { dbConnect } from "./db";
import { ProductModel, type ProductSchemaType } from "@/models/Product";
import type { Product, Category } from "@/types";

const PERFUME_CATEGORIES: Category[] = ["PERFUME_MEN", "PERFUME_WOMEN", "PERFUME_UNISEX"];
export type ProductGroup = "perfumes" | "cosmetics";

type LeanProduct = ProductSchemaType & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

/** Convert a lean Mongo document into the app's plain `Product` shape. */
function serialize(doc: LeanProduct): Product {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category as Product["category"],
    price: doc.price,
    description: doc.description ?? null,
    imageUrl: doc.imageUrl ?? null,
    thumbUrl: doc.thumbUrl ?? null,
    field1: doc.field1 ?? null,
    field2: doc.field2 ?? null,
    field3: doc.field3 ?? null,
    stock: doc.stock,
    featured: doc.featured,
    views: doc.views,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getProducts(
  opts: { category?: Category; group?: ProductGroup } = {}
): Promise<Product[]> {
  await dbConnect();
  const q: Record<string, unknown> = {};
  if (opts.category) q.category = opts.category;
  else if (opts.group === "perfumes") q.category = { $in: PERFUME_CATEGORIES };
  else if (opts.group === "cosmetics") q.category = { $nin: PERFUME_CATEGORIES };
  const docs = await ProductModel.find(q)
    .sort({ featured: -1, createdAt: -1 })
    .lean<LeanProduct[]>();
  return docs.map(serialize);
}

export async function getAllProducts(): Promise<Product[]> {
  await dbConnect();
  const docs = await ProductModel.find().sort({ createdAt: -1 }).lean<LeanProduct[]>();
  return docs.map(serialize);
}

/** Other in-stock products in the same category (for "you may also like"). */
export async function getRelatedProducts(category: Category, excludeSlug: string, limit = 4): Promise<Product[]> {
  await dbConnect();
  const docs = await ProductModel.find({ category, slug: { $ne: excludeSlug } })
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .lean<LeanProduct[]>();
  return docs.map(serialize);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await dbConnect();
  const docs = await ProductModel.find({ featured: true }).lean<LeanProduct[]>();
  return docs.map(serialize);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await dbConnect();
  const doc = await ProductModel.findOne({ slug }).lean<LeanProduct>();
  return doc ? serialize(doc) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  await dbConnect();
  if (!Types.ObjectId.isValid(id)) return null;
  const doc = await ProductModel.findById(id).lean<LeanProduct>();
  return doc ? serialize(doc) : null;
}
