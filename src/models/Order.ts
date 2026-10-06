import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ORDER_STATUSES = ["pending", "paid", "fulfilled", "cancelled"] as const;
export const ORDER_CHANNELS = ["whatsapp", "mpesa", "manual"] as const;

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    customerName: { type: String, default: null },
    customerPhone: { type: String, default: null },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    channel: { type: String, enum: ORDER_CHANNELS, default: "manual" },
    mpesaReceipt: { type: String, default: null },
    checkoutRequestId: { type: String, default: null, index: true },
    merchantRequestId: { type: String, default: null },
    resultDesc: { type: String, default: null },
    lastQueryAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type OrderSchemaType = InferSchemaType<typeof orderSchema>;

export const OrderModel: Model<OrderSchemaType> =
  (models.Order as Model<OrderSchemaType>) ?? model("Order", orderSchema);
