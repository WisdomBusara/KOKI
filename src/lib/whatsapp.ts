const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254700000000";

export interface CartLine { name: string; price: number; quantity: number; }

export const wa = {
  url(msg: string): string {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  },
  single(name: string, price: number): string {
    return this.url(`Hi KOKI, I'm interested in *${name}* (KES ${price.toLocaleString()}). Is it available?`);
  },
  cart(lines: CartLine[], total: number): string {
    const items = lines.map(l => `• ${l.quantity}× ${l.name} — KES ${(l.price * l.quantity).toLocaleString()}`).join("\n");
    return this.url(`Hi KOKI, I'd like to order:\n\n${items}\n\n*Total: KES ${total.toLocaleString()}*\n\nPlease confirm availability. Thank you!`);
  },
  inquiry(): string {
    return this.url("Hi KOKI, I'd like to learn more about your products. 🌿");
  },
};
