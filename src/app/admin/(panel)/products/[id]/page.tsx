import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { getProductById } from "@/lib/products";
import { updateProduct, deleteProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const update = updateProduct.bind(null, id);
  const remove = deleteProduct.bind(null, id);

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-5">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Edit product</h1>
        <DeleteProductButton action={remove} />
      </div>
      <ProductForm action={update} product={product} submitLabel="Save changes" />
    </div>
  );
}
