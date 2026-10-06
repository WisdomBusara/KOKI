import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: null },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

export type UserSchemaType = InferSchemaType<typeof userSchema>;

export const UserModel: Model<UserSchemaType> =
  (models.User as Model<UserSchemaType>) ?? model("User", userSchema);
