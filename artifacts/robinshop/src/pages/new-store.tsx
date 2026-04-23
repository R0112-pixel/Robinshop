import { useState } from "react";
import { AdminLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateStore, getListStoresQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NewStorePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createStore = useCreateStore();
  
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");

  const niches = [
    "Fashion", "Tech", "Beauty", "Fitness", "Home", "Food", "Pets", "Wellness", "Other"
  ];

  const languages: Array<{ code: "en" | "fr" | "es" | "ar" | "sw"; label: string }> = [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
    { code: "ar", label: "Arabic" },
    { code: "sw", label: "Swahili" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !niche || !description) {
      toast.error("Please fill out all fields");
      return;
    }

    try {
      const store = await createStore.mutateAsync({
        data: { name, niche, description, language: language as "en" | "fr" | "es" | "ar" | "sw" }
      });
      
      queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      
      toast.success("Store created successfully!");
      setLocation(`/stores/${store.id}`);
    } catch (error) {
      toast.error("Failed to create store");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create AI Store</h1>
            <p className="text-muted-foreground">Let AI generate your complete storefront</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Tell us what you want to build</CardDescription>
          </CardHeader>
          <CardContent>
            {createStore.isPending ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">AI is crafting your store...</h3>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    className="text-muted-foreground text-sm"
                  >
                    Generating branding, copy, and products...
                  </motion.div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Store Name</label>
                  <Input 
                    placeholder="e.g. ZenTech Audio" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Niche</label>
                  <Select value={niche} onValueChange={setNiche} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {niches.map(n => (
                        <SelectItem key={n} value={n.toLowerCase()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Store Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">All AI-generated content (branding, products, marketing) will be written in this language.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Describe your vision</label>
                  <Textarea 
                    placeholder="What makes this store special? Who is it for?" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={280}
                    className="resize-none h-32"
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {description.length}/280
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createStore.isPending}>
                  Generate Store
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
