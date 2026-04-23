import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock } from "lucide-react";
import { StoreHeader } from "@/components/store-header";
import { useCart } from "@/lib/cart";

export default function PublicCheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) },
  });
  const cart = useCart(slug!);

  const [step, setStep] = useState<"form" | "done">("form");
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  if (isLoading || !payload) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { store } = payload;
  const shipping = cart.subtotal > 0 ? 4.99 : 0;
  const tax = +(cart.subtotal * 0.08).toFixed(2);
  const total = cart.subtotal + shipping + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `RS-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);
    setStep("done");
    cart.clear();
  };

  if (step === "done") {
    return (
      <div
        className="min-h-[100dvh] flex flex-col font-sans bg-background"
        style={{
          '--store-primary': store.primaryColor || '#000',
          '--store-accent': store.accentColor || '#333',
        } as React.CSSProperties}
      >
        <StoreHeader slug={store.slug} storeName={store.name} />
        <main className="flex-1 container mx-auto px-4 py-20 max-w-lg text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--store-primary)' }} />
          <h1 className="text-3xl font-bold tracking-tight mb-3">Order placed!</h1>
          <p className="text-muted-foreground mb-1">
            Thanks {form.fullName.split(" ")[0] || ""}, your order is confirmed.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Order reference: <span className="font-mono font-semibold">{orderId}</span>
          </p>
          <p className="text-xs bg-muted/50 rounded-lg p-4 mb-8 text-muted-foreground">
            This is a demo storefront — no payment was processed and no goods will ship.
          </p>
          <Link href={`/s/${store.slug}`}>
            <Button style={{ backgroundColor: 'var(--store-primary)' }} className="text-white">
              Back to Store
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  if (cart.items.length === 0) {
    setLocation(`/s/${store.slug}/cart`);
    return null;
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col font-sans bg-background"
      style={{
        '--store-primary': store.primaryColor || '#000',
        '--store-accent': store.accentColor || '#333',
      } as React.CSSProperties}
    >
      <StoreHeader slug={store.slug} storeName={store.name} />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-2">
          <Lock className="h-6 w-6" /> Secure Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <section className="border rounded-xl p-6 bg-card space-y-4">
              <h2 className="font-bold text-lg">Contact</h2>
              <Input
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                data-testid="input-email"
              />
            </section>

            <section className="border rounded-xl p-6 bg-card space-y-4">
              <h2 className="font-bold text-lg">Shipping address</h2>
              <Input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                data-testid="input-fullname"
              />
              <Input
                required
                placeholder="Street address"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input required placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="col-span-1" />
                <Input required placeholder="ZIP" value={form.zip} onChange={(e) => setForm((p) => ({ ...p, zip: e.target.value }))} className="col-span-1" />
                <Input required placeholder="Country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} className="col-span-1" />
              </div>
            </section>

            <section className="border rounded-xl p-6 bg-muted/30 space-y-2">
              <h2 className="font-bold text-base">Payment</h2>
              <p className="text-sm text-muted-foreground">
                Demo mode — no card information is collected and no charges are made.
              </p>
            </section>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-white text-base"
              style={{ backgroundColor: 'var(--store-primary)' }}
              data-testid="button-place-order"
            >
              Place Order — ${total.toFixed(2)}
            </Button>
          </form>

          <aside className="border rounded-xl p-6 bg-card h-fit space-y-4 lg:sticky lg:top-6">
            <h2 className="font-bold text-lg">Order summary</h2>
            <div className="space-y-3 max-h-64 overflow-auto">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0 relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 font-medium">{item.name}</div>
                  </div>
                  <div className="font-medium">${(item.qty * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
