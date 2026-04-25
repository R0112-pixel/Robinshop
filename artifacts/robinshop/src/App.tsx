import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { useApiAuthSetup } from "./lib/auth-setup";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/pages/landing";
import SignInPageWrapper from "@/pages/sign-in";
import SignUpPageWrapper from "@/pages/sign-up";
import DashboardPage from "@/pages/dashboard";
import NewStorePage from "@/pages/new-store";
import StoreAdminPage from "@/pages/store-admin";
import AdminProductPage from "@/pages/admin-product";
import PublicStoreHomePage from "@/pages/public-store";
import PublicStoreProductsPage from "@/pages/public-products";
import PublicProductPage from "@/pages/public-product";
import PublicCartPage from "@/pages/public-cart";
import PublicCheckoutPage from "@/pages/public-checkout";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(239 84% 67%)",
    colorForeground: "hsl(222 47% 11%)",
    colorMutedForeground: "hsl(215.4 16.3% 46.9%)",
    colorDanger: "hsl(0 84.2% 60.2%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(214 32% 91%)",
    colorInputForeground: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)",
    fontFamily: "var(--app-font-sans)",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-sm border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-bold text-xl",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/90 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground text-xs",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formFieldSuccessText: "text-green-600",
    alertText: "text-destructive-foreground",
    logoBox: "h-8 w-auto mb-4",
    logoImage: "h-full object-contain",
    socialButtonsBlockButton: "border-border hover:bg-muted text-foreground transition-colors",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors font-medium rounded-md px-4 py-2",
    formFieldInput: "bg-background border-input text-foreground rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    footerAction: "mt-4 text-center text-sm",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive rounded-md px-4 py-3 text-sm",
    otpCodeFieldInput: "border-input text-foreground",
    formFieldRow: "mb-4",
    main: "p-6 sm:p-8",
  },
};

function ApiAuthSetup() {
  useApiAuthSetup();
  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function AuthedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPageWrapper} />
      <Route path="/sign-up/*?" component={SignUpPageWrapper} />
      <Route path="/dashboard"><AuthedRoute component={DashboardPage} /></Route>
      <Route path="/stores/new"><AuthedRoute component={NewStorePage} /></Route>
      <Route path="/stores/:id"><AuthedRoute component={StoreAdminPage} /></Route>
      <Route path="/stores/:id/products/:productId"><AuthedRoute component={AdminProductPage} /></Route>
      <Route path="/s/:slug" component={PublicStoreHomePage} />
      <Route path="/s/:slug/products" component={PublicStoreProductsPage} />
      <Route path="/s/:slug/products/:productId" component={PublicProductPage} />
      <Route path="/s/:slug/cart" component={PublicCartPage} />
      <Route path="/s/:slug/checkout" component={PublicCheckoutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ApiAuthSetup />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
