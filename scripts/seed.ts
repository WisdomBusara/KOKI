/**
 * Seed the MongoDB `products` collection with the initial catalogue.
 * Run with:  npm run db:seed   (reads MONGODB_URI from .env.local or .env.production)
 */
import dns from "node:dns";
import { existsSync } from "node:fs";
import mongoose from "mongoose";
import { ProductModel } from "../src/models/Product";
import { SEED_PRODUCTS } from "../src/lib/seed-data";

// Load .env.production first, then .env.local (local overrides) — works in dev
// (.env.local) and on the server (.env.production).
if (typeof process.loadEnvFile === "function") {
  for (const f of [".env.production", ".env.local"]) if (existsSync(f)) process.loadEnvFile(f);
}

const dnsServers = process.env.MONGODB_DNS_SERVERS;
if (dnsServers) dns.setServers(dnsServers.split(",").map((s) => s.trim()));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Fill in .env.local or .env.production first.");

  await mongoose.connect(uri);
  const result = await ProductModel.bulkWrite(
    SEED_PRODUCTS.map((p) => ({
      updateOne: { filter: { slug: p.slug }, update: { $set: p }, upsert: true },
    }))
  );
  const count = await ProductModel.countDocuments();
  console.log(
    `Seeded products — upserted ${result.upsertedCount}, modified ${result.modifiedCount}. Collection now has ${count}.`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
