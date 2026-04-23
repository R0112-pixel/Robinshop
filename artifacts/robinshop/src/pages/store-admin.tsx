import { AdminLayout } from "@/components/layout";
import { 
  useGetStore, 
  getGetStoreQueryKey, 
  useUpdateStore, 
  useDeleteStore, 
  useListStoreProducts, 
  getListStoreProductsQueryKey,
  useRegenerateStoreProducts,
  getListStoresQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Eye, ExternalLink, Settings, LayoutTemplate, Copy, RefreshCw, Trash2, Activity, Package } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { basePath } from "@/App";

export default function StoreAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: store, isLoading } = useGetStore(id!, { 
    query: { enabled: !!id, queryKey: getGetStoreQueryKey(id!) } 
  });
  
  const { data: products, isLoading: isProductsLoading } = useListStoreProducts(id!, {
    query: { enabled: !!id, queryKey: getListStoreProductsQueryKey(id!) }
  });

  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const regenProducts = useRegenerateStoreProducts();

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    homepageHeadline: "",
    homepageBody: "",
    primaryColor: "",
    accentColor: "",
    themeName: ""
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        tagline: store.tagline || "",
        description: store.description || "",
        homepageHeadline: store.homepageHeadline || "",
        homepageBody: store.homepageBody || "",
        primaryColor: store.primaryColor || "",
        accentColor: store.accentColor || "",
        themeName: store.themeName || ""
      });
    }
  }, [store]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStore.mutateAsync({
        id: id!,
        data: formData
      });
      queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey(id!) });
      queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
      toast.success("Store updated successfully");
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to delete store");
    }
  };

  const handleRegenProducts = async () => {
    try {
      await regenProducts.mutateAsync({ id: id! });
      queryClient.invalidateQueries({ queryKey: getListStoreProductsQueryKey(id!) });
      toast.success("Products regenerating...");
    } catch (error) {
      toast.error("Failed to regenerate products");
    }
  };

  const copyUrl = () => {
    if (store) {
      const url = `${window.location.origin}${basePath}/s/${store.slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Store URL copied to clipboard");
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Live at {liveUrl}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Store
              </a>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Store?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your store and all its products.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent data-[state=active]:shadow-none">Overview</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent data-[state=active]:shadow-none">Products</TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent data-[state=active]:shadow-none">Edit Info</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent data-[state=active]:shadow-none">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Visits</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{store.visits}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{store.productCount}</div>
                </CardContent>
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

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Store Products</h2>
              <Button onClick={handleRegenProducts} variant="outline" disabled={regenProducts.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${regenProducts.isPending ? 'animate-spin' : ''}`} />
                Regenerate Products
              </Button>
            </div>

            {isProductsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                  <Link key={product.id} href={`/stores/${store.id}/products/${product.id}`}>
                    <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all hover:shadow-md h-full flex flex-col group">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold line-clamp-1 mb-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-bold">${(product.price / 100).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {product.views}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <Package className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products generated yet.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <form onSubmit={handleUpdate}>
                <CardHeader>
                  <CardTitle>Edit Store Information</CardTitle>
                  <CardDescription>Update your store's branding and copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store Name</label>
                      <Input 
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tagline</label>
                      <Input 
                        value={formData.tagline}
                        onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Homepage Headline</label>
                    <Input 
                      value={formData.homepageHeadline}
                      onChange={e => setFormData(p => ({ ...p, homepageHeadline: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Homepage Body Copy</label>
                    <Textarea 
                      value={formData.homepageBody}
                      onChange={e => setFormData(p => ({ ...p, homepageBody: e.target.value }))}
                      className="h-24"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Color</label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={formData.primaryColor || "#000000"}
                          onChange={e => setFormData(p => ({ ...p, primaryColor: e.target.value }))}
                          className="w-12 p-1 px-2 h-10"
                        />
                        <Input 
                          value={formData.primaryColor}
                          onChange={e => setFormData(p => ({ ...p, primaryColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Accent Color</label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={formData.accentColor || "#000000"}
                          onChange={e => setFormData(p => ({ ...p, accentColor: e.target.value }))}
                          className="w-12 p-1 px-2 h-10"
                        />
                        <Input 
                          value={formData.accentColor}
                          onChange={e => setFormData(p => ({ ...p, accentColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateStore.isPending}>
                    {updateStore.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="overflow-hidden border-0 shadow-none">
              <div className="bg-muted p-2 rounded-t-xl flex items-center gap-2 border border-b-0 border-border">
                <div className="flex gap-1.5 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-background rounded-md text-xs px-3 py-1.5 text-muted-foreground flex items-center justify-between border">
                  <span className="truncate">{fullLiveUrl}</span>
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              <div className="border border-border rounded-b-xl overflow-hidden h-[600px] relative bg-background">
                <iframe 
                  src={liveUrl} 
                  className="w-full h-full border-0 absolute inset-0"
                  title="Store Preview"
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
