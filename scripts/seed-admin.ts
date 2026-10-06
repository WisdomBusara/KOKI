/**
 * Upsert the admin user from ADMIN_EMAIL / ADMIN_PASSWORD in .env.local.
 * Run with:  npm run db:seed:admin
 * The plaintext password is only read here and stored as a bcrypt hash.
 */
import dns from "node:dns";
import { existsSync } from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../src/models/User";

if (typeof process.loadEnvFile === "function") {
  for (const f of [".env.production", ".env.local"]) if (existsSync(f)) process.loadEnvFile(f);
}
const dnsServers = process.env.MONGODB_DNS_SERVERS;
if (dnsServers) dns.setServers(dnsServers.split(",").map((s) => s.trim()));

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local.");

  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.updateOne(
    { email },
    { $set: { email, passwordHash, role: "admin" } },
    { upsert: true }
  );
  console.log(`Admin user ready: ${email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
