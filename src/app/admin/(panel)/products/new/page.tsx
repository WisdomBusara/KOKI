import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-5">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-6">New product</h1>
      <ProductForm action={createProduct} submitLabel="Create product" />
    </div>
  );
}
