import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const CATEGORY_VALUES = [
  "PERFUME_MEN",
  "PERFUME_WOMEN",
  "PERFUME_UNISEX",
  "SKINCARE",
  "MAKEUP",
  "HAIRCARE",
] as const;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, enum: CATEGORY_VALUES, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: null },
    imageUrl: { type: String, default: null },
    thumbUrl: { type: String, default: null },
    // Perfume: Top/Heart/Base notes. Cosmetics: Ingredients/Benefits/Usage.
    field1: { type: String, default: null },
    field2: { type: String, default: null },
    field3: { type: String, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ProductSchemaType = InferSchemaType<typeof productSchema>;

// `models.Product` is reused if already compiled (avoids OverwriteModelError on HMR).
export const ProductModel: Model<ProductSchemaType> =
  (models.Product as Model<ProductSchemaType>) ?? model("Product", productSchema);
