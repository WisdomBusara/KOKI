"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageField from "@/components/admin/ImageField";
import { CATEGORIES, field1Label, field2Label, field3Label, type Category, type Product } from "@/types";
import type { ProductFormState } from "@/app/admin/(panel)/products/actions";

type Action = (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;

export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: Action;
  product?: Product;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  // Field labels follow the category; default to the product's category or the first option.
  const cat: Category = product?.category ?? CATEGORIES[0].value;

  const field = "space-y-1.5";
  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className={field}>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={field}>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={cat}
            className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className={field}>
          <Label htmlFor="price">Price (KES)</Label>
          <Input id="price" name="price" type="number" min={0} step={1} defaultValue={product?.price} required />
        </div>
        <div className={field}>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} required />
        </div>
      </div>

      <div className={field}>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="flex w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        />
      </div>

      <div className={field}>
        <Label>Image</Label>
        <ImageField defaultValue={product?.imageUrl} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className={field}>
          <Label htmlFor="field1">{field1Label(cat)}</Label>
          <Input id="field1" name="field1" defaultValue={product?.field1 ?? ""} />
        </div>
        <div className={field}>
          <Label htmlFor="field2">{field2Label(cat)}</Label>
          <Input id="field2" name="field2" defaultValue={product?.field2 ?? ""} />
        </div>
        <div className={field}>
          <Label htmlFor="field3">{field3Label(cat)}</Label>
          <Input id="field3" name="field3" defaultValue={product?.field3 ?? ""} />
        </div>
        <p className="text-xs text-stone-400">
          Labels adjust to the category (fragrance notes vs. ingredients/benefits/usage) on the product page.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4 rounded border-stone-300" />
        Featured on the homepage
      </label>

      {state.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
