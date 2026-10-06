import "server-only";
import { dbConnect } from "./db";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import type { Product } from "@/types";

export interface AdminStats {
  productCount: number;
  inventoryUnits: number;
  inventoryValue: number;
  outOfStock: number;
  lowStock: Pick<Product, "id" | "name" | "slug" | "stock">[];
  totalSales: number;
  paidOrderCount: number;
  pendingOrderCount: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  await dbConnect();

  const [productCount, outOfStock, inventoryAgg, lowStockDocs, salesAgg, pendingOrderCount] =
    await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ stock: 0 }),
      ProductModel.aggregate<{ units: number; value: number }>([
        { $group: { _id: null, units: { $sum: "$stock" }, value: { $sum: { $multiply: ["$price", "$stock"] } } } },
      ]),
      ProductModel.find({ stock: { $gt: 0, $lt: 5 } }).sort({ stock: 1 }).select("name slug stock").lean<
        { _id: unknown; name: string; slug: string; stock: number }[]
      >(),
      OrderModel.aggregate<{ total: number; count: number }>([
        { $match: { status: { $in: ["paid", "fulfilled"] } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      OrderModel.countDocuments({ status: "pending" }),
    ]);

  return {
    productCount,
    inventoryUnits: inventoryAgg[0]?.units ?? 0,
    inventoryValue: inventoryAgg[0]?.value ?? 0,
    outOfStock,
    lowStock: lowStockDocs.map((d) => ({ id: String(d._id), name: d.name, slug: d.slug, stock: d.stock })),
    totalSales: salesAgg[0]?.total ?? 0,
    paidOrderCount: salesAgg[0]?.count ?? 0,
    pendingOrderCount,
  };
}

export interface ProductInput {
  name: string;
  slug: string;
  category: Product["category"];
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  field1: string | null;
  field2: string | null;
  field3: string | null;
  featured: boolean;
}

export async function createProductDoc(data: ProductInput): Promise<void> {
  await dbConnect();
  await ProductModel.create(data);
}

export async function updateProductDoc(id: string, data: ProductInput): Promise<void> {
  await dbConnect();
  await ProductModel.findByIdAndUpdate(id, data, { runValidators: true });
}

export async function deleteProductDoc(id: string): Promise<void> {
  await dbConnect();
  await ProductModel.findByIdAndDelete(id);
}

export interface AdminOrder {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  channel: string;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: Date;
}

export async function getRecentOrders(limit = 50): Promise<AdminOrder[]> {
  await dbConnect();
  const docs = await OrderModel.find().sort({ createdAt: -1 }).limit(limit).lean<
    {
      _id: unknown;
      items: { name: string; quantity: number; price: number }[];
      total: number;
      status: string;
      channel: string;
      customerName: string | null;
      customerPhone: string | null;
      createdAt: Date;
    }[]
  >();
  return docs.map((d) => ({
    id: String(d._id),
    items: d.items ?? [],
    total: d.total,
    status: d.status,
    channel: d.channel,
    customerName: d.customerName ?? null,
    customerPhone: d.customerPhone ?? null,
    createdAt: d.createdAt,
  }));
}
