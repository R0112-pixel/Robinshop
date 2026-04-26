import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, DollarSign, Eye, MousePointerClick,
  ShoppingCart, Sparkles, Music2, Hash, Mail, FileText,
  Award, ArrowUpRight, ArrowDownRight
} from "lucide-react";

// ─── Sales Dashboard ─────────────────────────────────────────────────────────

export function SalesDashboard({ store, products }: {
  store: any;
  products: any[];
}) {
  const totalViews = products.reduce((a, p) => a + p.views, 0);
  const totalClicks = products.reduce((a, p) => a + p.clicks, 0);
  const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  const productData = products
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
      views: p.views,
      clicks: p.clicks,
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Store Visits"
          value={store.visits}
          icon={<Eye className="h-4 w-4" />}
          description="Total store page visits"
        />
        <StatCard
          title="Product Views"
          value={totalViews}
          icon={<Eye className="h-4 w-4" />}
          description="Total product views"
        />
        <StatCard
          title="Total Clicks"
          value={totalClicks}
          icon={<MousePointerClick className="h-4 w-4" />}
          description="Affiliate link clicks"
        />
        <StatCard
          title="Click Rate"
          value={`${clickRate}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Views to clicks ratio"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Views vs clicks per product</CardDescription>
        </CardHeader>
        <CardContent>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#6366f1" name="Views" />
                <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No product data yet. Share your store to get views." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Marketing Overview ───────────────────────────────────────────────────────

export function MarketingOverview({ assets }: { assets: any[] }) {
  const counts = {
    tiktok: assets.filter(a => a.type === "tiktok").length,
    instagram: assets.filter(a => a.type === "instagram").length,
    email: assets.filter(a => a.type === "email").length,
    seo: assets.filter(a => a.type === "seo").length,
  };

  const pieData = [
    { name: "TikTok", value: counts.tiktok, color: "#6366f1" },
    { name: "Instagram", value: counts.instagram, color: "#ec4899" },
    { name: "Email", value: counts.email, color: "#f59e0b" },
    { name: "SEO", value: counts.seo, color: "#10b981" },
  ].filter(d => d.value > 0);

  const marketingTypes = [
    { type: "tiktok", label: "TikTok Scripts", icon: Music2, count: counts.tiktok, color: "bg-indigo-500" },
    { type: "instagram", label: "Instagram Captions", icon: Hash, count: counts.instagram, color: "bg-pink-500" },
    { type: "email", label: "Email Sequences", icon: Mail, count: counts.email, color: "bg-amber-500" },
    { type: "seo", label: "SEO Blog Posts", icon: FileText, count: counts.seo, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketingTypes.map(m => (
          <Card key={m.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{m.label}</CardTitle>
              <m.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.count}</div>
              <p className="text-xs text-muted-foreground">assets generated</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Types of marketing content generated</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No marketing content generated yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assets</CardTitle>
            <CardDescription>Last 5 generated</CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <div className="space-y-3">
                {assets.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{a.type}</Badge>
                      <span className="line-clamp-1 text-muted-foreground">{a.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Generate your first marketing asset." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Product Comparison ───────────────────────────────────────────────────────

export function ProductComparison({ products }: { products: any[] }) {
  const sorted = [...products].sort((a, b) => b.views - a.views);
  const top = sorted.slice(0, 10);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#f97316", "#14b8a6", "#e11d48", "#84cc16"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" /> Top Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sorted[0] ? (
              <>
                <p className="font-bold line-clamp-1">{sorted[0].name}</p>
                <p className="text-sm text-muted-foreground">{sorted[0].views} views · {sorted[0].clicks} clicks</p>
              </>
            ) : <EmptyState message="No products yet" />}
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" /> Most Clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            {[...products].sort((a, b) => b.clicks - a.clicks)[0] ? (
              <>
                <p className="font-bold line-clamp-1">{[...products].sort((a, b) => b.clicks - a.clicks)[0].name}</p>
                <p className="text-sm text-muted-foreground">{[...products].sort((a, b) => b.clicks - a.clicks)[0].clicks} clicks</p>
              </>
            ) : <EmptyState message="No data yet" />}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-600" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sorted[sorted.length - 1] ? (
              <>
                <p className="font-bold line-clamp-1">{sorted[sorted.length - 1].name}</p>
                <p className="text-sm text-muted-foreground">{sorted[sorted.length - 1].views} views only</p>
              </>
            ) : <EmptyState message="No data yet" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Views Comparison</CardTitle>
          <CardDescription>Top 10 products by views</CardDescription>
        </CardHeader>
        <CardContent>
          {top.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={top} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={120}
                  tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "..." : v}
                />
                <Tooltip />
                <Bar dataKey="views" name="Views">
                  {top.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Add products to see comparison." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Score Ranking</CardTitle>
          <CardDescription>AI-rated conversion potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...products]
              .filter(p => p.conversionScore > 0)
              .sort((a, b) => b.conversionScore - a.conversionScore)
              .map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-6 text-muted-foreground">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                      <span className="text-sm font-bold">{p.conversionScore}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${p.conversionScore}%`,
                          backgroundColor: p.conversionScore >= 75 ? "#10b981" : p.conversionScore >= 50 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {products.filter(p => p.conversionScore > 0).length === 0 && (
              <EmptyState message="Use the Improve button on products to get conversion scores." />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Finance Dashboard ────────────────────────────────────────────────────────

export function FinanceDashboard({ products, store }: { products: any[]; store: any }) {
  const affiliateProducts = products.filter(p => p.affiliateUrl && p.affiliateUrl.length > 0);
  const totalProductValue = products.reduce((a, p) => a + p.price, 0);
  const estimatedRevenue = affiliateProducts.reduce((a, p) => a + (p.clicks * p.price * 0.05), 0);

  const commissionData = [
    { source: "Amazon", rate: "5%", products: products.filter(p => p.affiliateSource === "amazon").length },
    { source: "AliExpress", rate: "7%", products: products.filter(p => p.affiliateSource === "aliexpress").length },
    { source: "eBay", rate: "4%", products: products.filter(p => p.affiliateSource === "ebay").length },
  ].filter(d => d.products > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Affiliate Products"
          value={affiliateProducts.length}
          icon={<DollarSign className="h-4 w-4" />}
          description="Products with affiliate links"
        />
        <StatCard
          title="Total Store Value"
          value={`$${totalProductValue.toFixed(2)}`}
          icon={<ShoppingCart className="h-4 w-4" />}
          description="Combined product prices"
        />
        <StatCard
          title="Est. Commissions"
          value={`$${estimatedRevenue.toFixed(2)}`}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Based on clicks × avg commission"
        />
        <StatCard
          title="Affiliate Sources"
          value={commissionData.length}
          icon={<Sparkles className="h-4 w-4" />}
          description="Active affiliate programs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Programs Active</CardTitle>
          <CardDescription>Your connected affiliate sources</CardDescription>
        </CardHeader>
        <CardContent>
          {commissionData.length > 0 ? (
            <div className="space-y-3">
              {commissionData.map(d => (
                <div key={d.source} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">{d.source}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{d.products} products</span>
                    <Badge variant="secondary">{d.rate} commission</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Import products from Amazon, AliExpress or eBay to see affiliate data." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Potential</CardTitle>
          <CardDescription>Estimated earnings if clicks convert at 3%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {["amazon", "aliexpress", "ebay"].map(source => {
              const sourceProducts = products.filter(p => p.affiliateSource === source);
              const clicks = sourceProducts.reduce((a, p) => a + p.clicks, 0);
              const rates: Record<string, number> = { amazon: 0.05, aliexpress: 0.07, ebay: 0.04 };
              const avgPrice = sourceProducts.length > 0
                ? sourceProducts.reduce((a, p) => a + p.price, 0) / sourceProducts.length
                : 0;
              const est = clicks * avgPrice * rates[source] * 0.03;

              return (
                <div key={source} className="p-4 border rounded-lg space-y-1">
                  <p className="text-sm font-medium capitalize">{source}</p>
                  <p className="text-2xl font-bold">${est.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{clicks} clicks · {(rates[source] * 100).toFixed(0)}% rate</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Trends Dashboard ─────────────────────────────────────────────────────────

export function TrendsDashboard({ products, store }: { products: any[]; store: any }) {
  const topByViews = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
  const topByClicks = [...products].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  const topByScore = [...products].sort((a, b) => b.conversionScore - a.conversionScore).slice(0, 5);

  const trendData = products.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
    score: p.conversionScore,
    views: p.views,
    clicks: p.clicks,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Conversion score vs views for all products</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#6366f1" name="Views" strokeWidth={2} />
                <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Clicks" strokeWidth={2} />
                <Line type="monotone" dataKey="score" stroke="#f59e0b" name="Score" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Add and view products to see trends." />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <TrendList title="🔥 Trending By Views" items={topByViews} metric="views" />
        <TrendList title="👆 Most Clicked" items={topByClicks} metric="clicks" />
        <TrendList title="⭐ Highest Scored" items={topByScore} metric="conversionScore" />
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({ title, value, icon, description }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function TrendList({ title, items, metric }: {
  title: string;
  items: any[];
  metric: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-bold w-4">#{i + 1}</span>
                  <span className="line-clamp-1">{p.name}</span>
                </div>
                <Badge variant="secondary">{p[metric]}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No data yet." />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground text-sm">
      {message}
    </div>
  );
}
