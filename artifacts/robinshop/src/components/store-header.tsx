import { Link } from "wouter";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";

export function StoreHeader({ slug, storeName }: { slug: string; storeName: string }) {
  const { totalItems } = useCart(slug);
  return (
    <header className="container mx-auto px-4 h-20 flex items-center justify-between border-b">
      <Link href={`/s/${slug}`} className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--store-primary)" }}
        >
          <ShoppingBag size={18} />
        </div>
        {storeName}
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link href={`/s/${slug}`} className="text-muted-foreground hover:text-foreground">Home</Link>
        <Link href={`/s/${slug}/products`} className="text-muted-foreground hover:text-foreground">Shop</Link>
        <Link href={`/s/${slug}/cart`} className="relative inline-flex items-center gap-1 hover:text-foreground" data-testid="link-cart">
          <ShoppingCart size={18} />
          {totalItems > 0 && (
            <Badge
              className="absolute -top-2 -right-3 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px]"
              style={{ backgroundColor: "var(--store-primary)" }}
            >
              {totalItems}
            </Badge>
          )}
        </Link>
      </nav>
    </header>
  );
}
