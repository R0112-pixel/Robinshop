import { useState } from "react";
import { isNewUser } from "@/lib/new-user";
import { isNewUser } from "@/lib/new-user";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Store, Package, Music2, TrendingUp, 
  ChevronRight, X, CheckCircle2, Sparkles,
  ExternalLink, DollarSign
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: Store,
    title: "Create Your First Store",
    description: "Tell our AI your niche and it builds your entire store automatically — products, branding, colors, everything.",
    action: "Create Store",
    href: "/stores/new",
    color: "bg-indigo-500",
  },
  {
    id: 2,
    icon: Package,
    title: "Import Affiliate Products",
    description: "Paste any Amazon, AliExpress or eBay product URL. Your store automatically becomes an affiliate and earns commission on sales.",
    action: "Open Your Store",
    href: null,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    icon: Music2,
    title: "Generate TikTok Scripts",
    description: "Go to your store → Marketing tab → Click TikTok Ad Script. AI writes a viral script for your products in seconds.",
    action: "View Marketing",
    href: null,
    color: "bg-pink-500",
  },
  {
    id: 4,
    icon: DollarSign,
    title: "Share & Earn",
    description: "Share your public store link on TikTok, Instagram and WhatsApp. Every sale earns you affiliate commission automatically.",
    action: "View Dashboard",
    href: "/dashboard",
    color: "bg-amber-500",
  },
];

export function OnboardingBanner({ storeCount }: { storeCount: number }) {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("onboarding-dismissed") === "true" || localStorage.getItem("onboarding-completed") === "true" || localStorage.getItem("onboarding-completed") === "true"
  );
  const [currentStep, setCurrentStep] = useState(0);

  if (dismissed || storeCount >= 3 || !isNewUser()) return null;

  const completedSteps = storeCount > 0 ? 1 : 0;

  const handleDismiss = () => {
    localStorage.setItem("onboarding-dismissed", "true");
    setDismissed(true);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Get Started with RobinShop</h2>
            <span className="text-sm text-muted-foreground">
              {completedSteps}/4 steps complete
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / 4) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const completed = i < completedSteps;
            const active = i === currentStep;

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(i)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center`}>
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Icon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  {completed && (
                    <span className="text-xs text-emerald-600 font-medium">Done</span>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                {active && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {step.description}
                  </p>
                )}
                {active && step.href && (
                  <Link href={step.href}>
                    <Button size="sm" className="w-full gap-1">
                      {step.action}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function WelcomeBanner({ userName }: { userName: string }) {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("welcome-dismissed") === "true"
  );

  if (dismissed) return null;

  return (
    <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Welcome to RobinShop{userName ? `, ${userName}` : ""}! 🎉
            </h2>
            <p className="text-white/80 mb-4 max-w-lg">
              You're one step away from your own AI-powered online store. 
              Create your first store in 30 seconds — no experience needed.
            </p>
            <div className="flex gap-3">
              <Link href="/stores/new">
                <Button className="bg-white text-indigo-600 hover:bg-white/90">
                  <Store className="h-4 w-4 mr-2" />
                  Create My First Store
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => {
                  localStorage.setItem("welcome-dismissed", "true");
                  setDismissed(true);
                }}
              >
                Skip for now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => {
              localStorage.setItem("welcome-dismissed", "true");
              setDismissed(true);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
