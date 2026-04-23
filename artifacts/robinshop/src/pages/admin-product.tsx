import { AdminLayout } from "@/components/layout";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AdminProductPage() {
  const { id: storeId, productId } = useParams<{ id: string; productId: string }>();
  
  const { data: product, isLoading } = useGetProduct(productId!, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId!) }
  });

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
              <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
              <div className="text-2xl font-semibold text-primary">
                ${(product.price / 100).toFixed(2)}
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="pt-6 border-t grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Total Views
                </div>
                <div className="font-medium text-lg">{product.views}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Added On
                </div>
                <div className="font-medium text-lg">
                  {format(new Date(product.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
