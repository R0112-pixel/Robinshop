import { AdminLayout } from "@/components/layout";
import {
  useGetProduct,
  getGetProductQueryKey,
  useImproveProduct,
  getListStoreProductsQueryKey,
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Calendar, MousePointerClick, Sparkles, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminProductPage() {
  const { id: storeId, productId } = useParams<{ id: string; productId: string }>();
  const queryClient = useQueryClient();
  const improve = useImproveProduct();

  const { data: product, isLoading } = useGetProduct(productId!, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId!) }
  });

  const handleImprove = async () => {
    try {
      await improve.mutateAsync({ productId: productId! });
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId!) });
      queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(storeId!) });
      toast.success("Description rewritten and scored");
    } catch {
      toast.error("Failed to improve. Try again in a moment.");
    }
  };

  if (isLoading || !product) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-24" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href={`/stores/${storeId}`}>
          <Button variant="ghost" className="pl-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border shadow-sm">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {product.category && <Badge variant="secondary" className="capitalize">{product.category}</Badge>}
                <Badge variant="outline" className="capitalize">{product.source}</Badge>
                {product.conversionScore > 0 && (
                  <Badge
                    className="gap-1"
                    style={{
                      backgroundColor:
                        product.conversionScore >= 75
                          ? "rgb(22 163 74)"
                          : product.conversionScore >= 50
                            ? "rgb(202 138 4)"
                            : "rgb(220 38 38)",
                    }}
                  >
                    <TrendingUp className="h-3 w-3" /> Conversion {product.conversionScore}/100
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
              <div className="text-2xl font-semibold text-primary">
                ${product.price.toFixed(2)}
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleImprove}
              disabled={improve.isPending}
              className="w-full"
              data-testid="button-improve-product"
            >
              <Sparkles className={`h-4 w-4 mr-2 ${improve.isPending ? "animate-pulse" : ""}`} />
              {improve.isPending ? "Improving..." : "Improve with AI (rewrite + score)"}
            </Button>

            <div className="pt-6 border-t grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Views
                </div>
                <div className="font-medium text-lg">{product.views}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4" /> Clicks
                </div>
                <div className="font-medium text-lg">{product.clicks}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Added
                </div>
                <div className="font-medium text-lg">
                  {format(new Date(product.createdAt), "MMM d")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
