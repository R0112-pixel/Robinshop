import { AdminLayout } from "@/components/layout";
import {
  useGetStore,
  getGetStoreQueryKey,
  useUpdateStore,
  useDeleteStore,
  useListStoreProducts,
  getListStoreProductsQueryKey,
  useRegenerateStoreProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListMarketingAssets,
  getListMarketingAssetsQueryKey,
  useGenerateMarketingAsset,
  useDeleteMarketingAsset,
  useGetDropshipSuggestions,
  getGetDropshipSuggestionsQueryKey,
  getListStoresQueryKey,
  getGetDashboardSummaryQueryKey,
  useImproveProduct,
  getMarketingPack,
} from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Eye, ExternalLink, LayoutTemplate, Copy, RefreshCw, Trash2,
  Activity, Package, Plus, Pencil, Sparkles, Globe, ShoppingCart,
  TrendingUp, Mail, Music2, Hash, FileText, Download, MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { basePath } from "@/App";

type LangCode = "en" | "fr" | "es" | "ar" | "sw";
type ProductSource = "ai" | "manual" | "dropship";
type MarketingType = "tiktok" | "instagram" | "email" | "seo";

const LANG_LABELS: Record<LangCode, string> = {
  en: "English", fr: "French", es: "Spanish", ar: "Arabic", sw: "Swahili",
};

const MARKETING_META: Record<MarketingType, { label: string; icon: typeof Music2; description: string }> = {
  tiktok:    { label: "TikTok Ad Script",          icon: Music2,   description: "Viral 30–45s ad script with hook → CTA." },
  instagram: { label: "Instagram Caption",         icon: Hash,     description: "Caption + 12–18 high-performing hashtags." },
  email:     { label: "Email Sequence",            icon: Mail,     description: "3-email welcome sequence with subject lines." },
  seo:       { label: "SEO Blog Post",             icon: FileText, description: "600–800 word post with keywords + meta." },
};

export default function StoreAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useGetStore(id!, {
    query: { enabled: !!id, queryKey: getGetStoreQueryKey(id!) },
  });

  const { data: products, isLoading: isProductsLoading } = useListStoreProducts(id!, {
    query: { enabled: !!id, queryKey: getListStoreProductsQueryKey(id!) },
  });

  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const regenProducts = useRegenerateStoreProducts();

  const [formData, setFormData] = useState({
    name: "", tagline: "", description: "", language: "en" as LangCode,
    homepageHeadline: "", homepageBody: "", primaryColor: "", accentColor: "", themeName: "",
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        tagline: store.tagline || "",
        description: store.description || "",
        language: ((store.language as LangCode) ?? "en"),
        homepageHeadline: store.homepageHeadline || "",
        homepageBody: store.homepageBody || "",
        primaryColor: store.primaryColor || "",
        accentColor: store.accentColor || "",
        themeName: store.themeName || "",
      });
    }
  }, [store]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStore.mutateAsync({ id: id!, data: formData });
      queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey(id!) });
      queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
      toast.success("Store updated");
    } catch {
      toast.error("Failed to update store");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStore.mutateAsync({ id: id! });
      queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      toast.success("Store deleted");
      setLocation("/dashboard");
    } catch {
      toast.error("Failed to delete store");
    }
  };

  const handleRegenProducts = async () => {
    try {
      await regenProducts.mutateAsync({ id: id! });
      queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(id!) });
      toast.success("AI products regenerated");
    } catch {
      toast.error("Failed to regenerate products");
    }
  };

  const copyUrl = () => {
    if (store) {
      const url = `${window.location.origin}${basePath}/s/${store.slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Store URL copied");
    }
  };

  if (isLoading || !store) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  const liveUrl = `/s/${store.slug}`;
  const fullLiveUrl = `${window.location.origin}${basePath}${liveUrl}`;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
              <Badge variant="secondary" className="gap-1">
                <Globe className="h-3 w-3" />
                {LANG_LABELS[(store.language as LangCode) ?? "en"]}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Live at {liveUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyUrl}>
              <Copy className="h-4 w-4 mr-2" /> Copy URL
            </Button>
            <Button asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> View Store
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Store?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes the store, products, and marketing content.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6 overflow-x-auto">
            {["overview", "products", "marketing", "dropshipping", "edit", "preview"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent data-[state=active]:shadow-none capitalize"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Visits</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{store.visits}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{store.productCount}</div></CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
                <CardDescription>AI-generated brand guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Primary Color</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border shadow-sm" style={{ backgroundColor: store.primaryColor }} />
                      <code className="text-xs">{store.primaryColor}</code>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Accent Color</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border shadow-sm" style={{ backgroundColor: store.accentColor }} />
                      <code className="text-xs">{store.accentColor}</code>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Theme</div>
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                    <span>{store.themeName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-lg font-semibold">Store Products</h2>
              <div className="flex gap-2">
                <Button onClick={handleRegenProducts} variant="outline" disabled={regenProducts.isPending}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${regenProducts.isPending ? "animate-spin" : ""}`} />
                  Regenerate AI
                </Button>
                <ProductFormDialog storeId={id!} mode="create" />
              </div>
            </div>

            {isProductsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Card key={p.id} className="overflow-hidden h-full flex flex-col group">
                    <Link href={`/stores/${store.id}/products/${p.id}`}>
                      <div className="aspect-square bg-muted relative overflow-hidden cursor-pointer">
                        <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                        <Badge className="absolute top-2 right-2 capitalize" variant={p.source === "ai" ? "default" : p.source === "dropship" ? "secondary" : "outline"}>
                          {p.source}
                        </Badge>
                        {p.conversionScore > 0 && (
                          <Badge
                            className="absolute top-2 left-2 gap-1"
                            style={{
                              backgroundColor:
                                p.conversionScore >= 75
                                  ? "rgb(22 163 74)"
                                  : p.conversionScore >= 50
                                    ? "rgb(202 138 4)"
                                    : "rgb(220 38 38)",
                            }}
                          >
                            <TrendingUp className="h-3 w-3" /> {p.conversionScore}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        {p.category && (
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{p.category}</div>
                        )}
                        <h3 className="font-semibold line-clamp-1 mb-1">{p.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">${p.price.toFixed(2)}</span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views}</span>
                          <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {p.clicks}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 pt-2 border-t">
                        <ImproveProductButton storeId={id!} productId={p.id} />
                        <ProductFormDialog
                          storeId={id!}
                          mode="edit"
                          product={p}
                          trigger={
                            <Button variant="ghost" size="sm" className="flex-1">
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          }
                        />
                        <DeleteProductButton storeId={id!} productId={p.id} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <Package className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products yet. Add one manually or regenerate with AI.</p>
              </Card>
            )}
          </TabsContent>

          {/* MARKETING */}
          <TabsContent value="marketing" className="space-y-6">
            <MarketingTab storeId={id!} language={(store.language as LangCode) ?? "en"} />
          </TabsContent>

          {/* DROPSHIPPING */}
          <TabsContent value="dropshipping" className="space-y-6">
            <DropshippingTab storeId={id!} />
          </TabsContent>

          {/* EDIT */}
          <TabsContent value="edit">
            <Card>
              <form onSubmit={handleUpdate}>
                <CardHeader>
                  <CardTitle>Edit Store Information</CardTitle>
                  <CardDescription>Update branding, copy, and language.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store Name</label>
                      <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tagline</label>
                      <Input value={formData.tagline} onChange={(e) => setFormData((p) => ({ ...p, tagline: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select value={formData.language} onValueChange={(v) => setFormData((p) => ({ ...p, language: v as LangCode }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(LANG_LABELS).map(([code, label]) => (
                          <SelectItem key={code} value={code}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">New AI generations (products, marketing, dropshipping) will use this language.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Homepage Headline</label>
                    <Input value={formData.homepageHeadline} onChange={(e) => setFormData((p) => ({ ...p, homepageHeadline: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Homepage Body Copy</label>
                    <Textarea value={formData.homepageBody} onChange={(e) => setFormData((p) => ({ ...p, homepageBody: e.target.value }))} className="h-24" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {(["primaryColor", "accentColor"] as const).map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-sm font-medium capitalize">{field === "primaryColor" ? "Primary Color" : "Accent Color"}</label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData[field] || "#000000"}
                            onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                            className="w-12 p-1 px-2 h-10"
                          />
                          <Input
                            value={formData[field]}
                            onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={updateStore.isPending}>
                    {updateStore.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

          {/* PREVIEW */}
          <TabsContent value="preview">
            <Card className="overflow-hidden border-0 shadow-none">
              <div className="bg-muted p-2 rounded-t-xl flex items-center gap-2 border border-b-0 border-border">
                <div className="flex gap-1.5 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-background rounded-md text-xs px-3 py-1.5 text-muted-foreground flex items-center justify-between border">
                  <span className="truncate">{fullLiveUrl}</span>
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              <div className="border border-border rounded-b-xl overflow-hidden h-[600px] relative bg-background">
                <iframe src={liveUrl} className="w-full h-full border-0 absolute inset-0" title="Store Preview" />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// ---------- Product Form Dialog ----------
function ProductFormDialog({
  storeId,
  mode,
  product,
  trigger,
}: {
  storeId: string;
  mode: "create" | "edit";
  product?: { id: string; name: string; description: string; price: number; imageUrl: string; source: string; category?: string };
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 19.99,
    imageUrl: product?.imageUrl ?? "",
    source: (product?.source as ProductSource) ?? "manual",
    category: product?.category ?? "",
  });

  useEffect(() => {
    if (open && product) {
      setData({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        source: product.source as ProductSource,
        category: product.category ?? "",
      });
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await create.mutateAsync({ id: storeId, data });
        toast.success("Product added");
      } else if (product) {
        await update.mutateAsync({ productId: product.id, data });
        toast.success("Product updated");
      }
      queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(storeId) });
      queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey(storeId) });
      setOpen(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Product" : "Edit Product"}</DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Manually add a product to this store." : "Update this product's details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={data.name} onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={data.description} onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))} required className="h-24" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (USD)</label>
                <Input type="number" min="0" step="0.01" value={data.price} onChange={(e) => setData((p) => ({ ...p, price: Number(e.target.value) }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select value={data.source} onValueChange={(v) => setData((p) => ({ ...p, source: v as ProductSource }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="dropship">Dropship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (optional)</label>
              <Input placeholder="e.g. Apparel, Beauty, Home" value={data.category} onChange={(e) => setData((p) => ({ ...p, category: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL (optional)</label>
              <Input placeholder="Leave blank for auto-generated image" value={data.imageUrl} onChange={(e) => setData((p) => ({ ...p, imageUrl: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Add Product" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Improve Product Button ----------
function ImproveProductButton({ storeId, productId }: { storeId: string; productId: string }) {
  const queryClient = useQueryClient();
  const improve = useImproveProduct();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex-1"
      disabled={improve.isPending}
      onClick={async () => {
        try {
          await improve.mutateAsync({ productId });
          queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(storeId) });
          toast.success("Description improved");
        } catch {
          toast.error("Failed to improve");
        }
      }}
      data-testid={`button-improve-${productId}`}
    >
      <Sparkles className={`h-3 w-3 mr-1 ${improve.isPending ? "animate-pulse" : ""}`} />
      Improve
    </Button>
  );
}

// ---------- Delete Product ----------
function DeleteProductButton({ storeId, productId }: { storeId: string; productId: string }) {
  const queryClient = useQueryClient();
  const del = useDeleteProduct();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this product?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground"
            onClick={async () => {
              try {
                await del.mutateAsync({ productId });
                queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(storeId) });
                queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey(storeId) });
                toast.success("Product deleted");
              } catch {
                toast.error("Failed to delete");
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------- Marketing Tab ----------
function MarketingTab({ storeId, language }: { storeId: string; language: LangCode }) {
  const queryClient = useQueryClient();
  const { data: assets, isLoading } = useListMarketingAssets(storeId, {
    query: { enabled: !!storeId, queryKey: getListMarketingAssetsQueryKey(storeId) },
  });
  const generate = useGenerateMarketingAsset();
  const del = useDeleteMarketingAsset();
  const [pendingType, setPendingType] = useState<MarketingType | null>(null);

  const handleGenerate = async (type: MarketingType) => {
    setPendingType(type);
    try {
      await generate.mutateAsync({ id: storeId, data: { type } });
      queryClient.invalidateQueries({ queryKey: getListMarketingAssetsQueryKey(storeId) });
      toast.success(`${MARKETING_META[type].label} generated`);
    } catch {
      toast.error("Failed to generate. Try again in a moment.");
    } finally {
      setPendingType(null);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await del.mutateAsync({ assetId });
      queryClient.invalidateQueries({ queryKey: getListMarketingAssetsQueryKey(storeId) });
      toast.success("Asset deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleDownloadPack = async () => {
    try {
      const md = await getMarketingPack(storeId);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marketing-pack-${storeId}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Marketing pack downloaded");
    } catch {
      toast.error("Generate at least one asset first");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>AI Marketing Engine</CardTitle>
            <CardDescription>
              Generate ready-to-publish marketing in {LANG_LABELS[language]}.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadPack} disabled={!assets || assets.length === 0} data-testid="button-download-pack">
            <Download className="h-4 w-4 mr-2" /> Download Pack (.md)
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(MARKETING_META) as MarketingType[]).map((t) => {
            const meta = MARKETING_META[t];
            const Icon = meta.icon;
            return (
              <Button
                key={t}
                variant="outline"
                className="h-auto flex-col items-start p-4 gap-2 text-left whitespace-normal"
                disabled={pendingType !== null}
                onClick={() => handleGenerate(t)}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Icon className="h-4 w-4 text-primary" />
                  {meta.label}
                  {pendingType === t && <RefreshCw className="h-3 w-3 animate-spin ml-auto" />}
                </div>
                <p className="text-xs text-muted-foreground font-normal">{meta.description}</p>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : assets && assets.length > 0 ? (
        <div className="space-y-4">
          {assets.map((a) => {
            const meta = MARKETING_META[a.type as MarketingType];
            const Icon = meta?.icon ?? FileText;
            return (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {a.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {meta?.label ?? a.type} · {LANG_LABELS[(a.language as LangCode) ?? "en"]} · {new Date(a.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(a.content);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/50 p-4 rounded-md leading-relaxed">{a.content}</pre>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No marketing content yet. Pick a format above to generate.</p>
        </Card>
      )}
    </>
  );
}

// ---------- Dropshipping Tab ----------
function DropshippingTab({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const create = useCreateProduct();
  const [region, setRegion] = useState<string>("");

  const params = region ? { region } : {};
  const { data, isLoading, refetch, isFetching } = useGetDropshipSuggestions(
    storeId,
    params,
    { query: { enabled: !!storeId, queryKey: getGetDropshipSuggestionsQueryKey(storeId, params) } },
  );

  const handleImport = async (item: { name: string; description: string; estimatedPrice: number }) => {
    try {
      await create.mutateAsync({
        id: storeId,
        data: {
          name: item.name,
          description: item.description,
          price: item.estimatedPrice,
          imageUrl: "",
          source: "dropship",
        },
      });
      queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(storeId) });
      queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey(storeId) });
      toast.success(`Imported "${item.name}" as a dropship product`);
    } catch {
      toast.error("Failed to import");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Dropshipping Trends</CardTitle>
              <CardDescription>
                AI-curated trending products. Region detected: <strong>{data?.region ?? "—"}</strong>. Available platforms: <strong>{data?.platforms?.join(", ") ?? "—"}</strong>.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={region || "auto"} onValueChange={(v) => setRegion(v === "auto" ? "" : v)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="EU">Europe</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                  <SelectItem value="KE">Kenya</SelectItem>
                  <SelectItem value="GH">Ghana</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="EG">Egypt</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((it, i) => {
            const cost = +(it.estimatedPrice * 0.4).toFixed(2);
            const margin = +(it.estimatedPrice - cost).toFixed(2);
            const marginPct = Math.round((margin / it.estimatedPrice) * 100);
            return (
              <Card key={i} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{it.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize shrink-0">{it.platform}</Badge>
                  </div>
                  <CardDescription className="line-clamp-3 mt-1">{it.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-3 pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-base">${it.estimatedPrice.toFixed(2)}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" /> Trend {it.trendScore}
                    </span>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2 text-xs space-y-0.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Est. cost</span><span>${cost.toFixed(2)}</span></div>
                    <div className="flex justify-between font-medium"><span className="text-muted-foreground">Profit / unit</span><span className="text-green-600">${margin.toFixed(2)} ({marginPct}%)</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleImport(it)} disabled={create.isPending}>
                      <ShoppingCart className="h-3 w-3 mr-1" /> Import
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={it.platformUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No suggestions available right now. Try refreshing.</p>
        </Card>
      )}
    </>
  );
}
