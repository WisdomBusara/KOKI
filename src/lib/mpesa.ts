import "server-only";

const ENV = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
const BASE = ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

function cfg(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is not set`);
  return v;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const basic = Buffer.from(`${cfg("MPESA_CONSUMER_KEY")}:${cfg("MPESA_CONSUMER_SECRET")}`).toString("base64");
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: string };
  tokenCache = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in) * 1000 };
  return data.access_token;
}

function timestamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** Normalise a Kenyan number to 2547XXXXXXXX / 2541XXXXXXXX, or null if invalid. */
export function normalizePhone(input: string): string | null {
  let n = input.replace(/\D/g, "");
  if (n.startsWith("0")) n = "254" + n.slice(1);
  else if (n.startsWith("7") || n.startsWith("1")) n = "254" + n;
  else if (n.startsWith("2540")) n = "254" + n.slice(4);
  return /^254(7|1)\d{8}$/.test(n) ? n : null;
}

export interface StkResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage: string;
}

export async function initiateStkPush(opts: {
  amount: number;
  phone: string;
  accountRef: string;
  description?: string;
}): Promise<StkResult> {
  const shortcode = cfg("MPESA_SHORTCODE");
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${cfg("MPESA_PASSKEY")}${ts}`).toString("base64");
  const token = await getAccessToken();

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
    Amount: Math.max(1, Math.round(opts.amount)),
    PartyA: opts.phone,
    PartyB: shortcode,
    PhoneNumber: opts.phone,
    CallBackURL: cfg("MPESA_CALLBACK_URL"),
    AccountReference: opts.accountRef.slice(0, 12),
    TransactionDesc: (opts.description || "KOKI order").slice(0, 13),
  };

  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    ResponseCode?: string;
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    CustomerMessage?: string;
    ResponseDescription?: string;
    errorMessage?: string;
  };

  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(data.errorMessage || data.ResponseDescription || `STK push failed (${res.status})`);
  }
  return {
    merchantRequestId: data.MerchantRequestID ?? "",
    checkoutRequestId: data.CheckoutRequestID ?? "",
    customerMessage: data.CustomerMessage ?? "Check your phone to complete payment.",
  };
}

export interface StkQueryResult {
  /** "0" = paid; "1032" = cancelled; "1037"/"PENDING" = still processing; other = failed. */
  resultCode: string;
  resultDesc: string;
}

/** Ask Safaricom for the final state of an STK push, for when the callback never arrived. */
export async function queryStkStatus(checkoutRequestId: string): Promise<StkQueryResult> {
  const shortcode = cfg("MPESA_SHORTCODE");
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${cfg("MPESA_PASSKEY")}${ts}`).toString("base64");
  const token = await getAccessToken();

  const res = await fetch(`${BASE}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: shortcode, Password: password, Timestamp: ts, CheckoutRequestID: checkoutRequestId }),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    ResultCode?: string | number;
    ResultDesc?: string;
    errorMessage?: string;
    ResponseDescription?: string;
  };

  // While the push is unresolved Daraja returns an error (e.g. 500.001.1001) rather than a ResultCode.
  if (data.ResultCode !== undefined) {
    return { resultCode: String(data.ResultCode), resultDesc: String(data.ResultDesc ?? "") };
  }
  return { resultCode: "PENDING", resultDesc: String(data.errorMessage ?? data.ResponseDescription ?? "processing") };
}
