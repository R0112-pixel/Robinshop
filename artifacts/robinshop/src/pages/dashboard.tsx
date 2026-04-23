import { useGetDashboardSummary, useListStores } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Store as StoreIcon, Package, Eye, Activity, TrendingUp, MousePointerClick } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: stores, isLoading: isStoresLoading } = useListStores();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link href="/stores/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Store
            </Button>
          </Link>
        </div>

        {isSummaryLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                  <StoreIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalStores}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalProducts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Visits</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalVisits}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalProductViews}</div>
                </CardContent>
              </Card>
            </div>

            {summary.recentProducts.length > 0 && (() => {
              const top = [...summary.recentProducts]
                .sort((a, b) => (b.conversionScore - a.conversionScore) || (b.views - a.views))
                .slice(0, 4);
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Top-Performing Products
                    </CardTitle>
                    <CardDescription>Ranked by AI conversion-potential score and traffic.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {top.map((p) => (
                        <Link key={p.id} href={`/stores/${p.storeId}/products/${p.id}`}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border">
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover bg-muted" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground flex gap-3">
                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                                <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{p.clicks}</span>
                                <span>${p.price.toFixed(2)}</span>
                              </div>
                            </div>
                            {p.conversionScore > 0 && (
                              <Badge
                                style={{
                                  backgroundColor:
                                    p.conversionScore >= 75
                                      ? "rgb(22 163 74)"
                                      : p.conversionScore >= 50
                                        ? "rgb(202 138 4)"
                                        : "rgb(220 38 38)",
                                }}
                              >
                                {p.conversionScore}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </>
        ) : null}

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Your Stores</h2>
          {isStoresLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : stores && stores.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store, i) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/stores/${store.id}`}>
                    <Card className="hover:border-primary/50 cursor-pointer transition-colors h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-1">{store.name}</CardTitle>
                          <div 
                            className="w-4 h-4 rounded-full border shadow-sm"
                            style={{ backgroundColor: store.primaryColor || "var(--primary)" }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground truncate pt-1">
                          /{store.slug}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="mb-4">
                          <Badge variant="secondary">{store.niche}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" /> {store.productCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" /> {store.visits}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <StoreIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">No stores yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Create your first AI-generated store to start selling in minutes.
              </p>
              <Link href="/stores/new">
                <Button>Create your first AI store</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
