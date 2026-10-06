import dns from "node:dns";
import mongoose from "mongoose";

// Cache the connection across hot reloads in dev and across lambda invocations
// in production, so we don't open a new pool on every request.
declare global {
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.local.example to .env.local and fill it in.");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Some networks' default resolvers refuse the SRV lookup that `mongodb+srv://`
    // needs. MONGODB_DNS_SERVERS (e.g. "8.8.8.8,1.1.1.1") overrides it at call time.
    // Leave unset in production so hosted environments use their own resolver.
    const dnsServers = process.env.MONGODB_DNS_SERVERS;
    if (dnsServers) dns.setServers(dnsServers.split(",").map((s) => s.trim()));
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
