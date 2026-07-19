import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useClerk,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "./components/layout";
import { Home } from "./pages/home";
import { Timetable } from "./pages/timetable";
import {
  ClassDetail,
  ClassesPage,
  PackageDetail,
  Packages,
} from "./pages/packages";
import { Team } from "./pages/team";
import { Portal, PortalLogin } from "./pages/portal";
import { Rental } from "./pages/rental";
import { Checkout } from "./pages/checkout";
import NotFound from "./pages/not-found";
import { Dashboard } from "./pages/admin/dashboard";
import { Students } from "./pages/admin/students";
import { Classes } from "./pages/admin/classes";
import { AdminPackages } from "./pages/admin/packages";
import { Payments } from "./pages/admin/payments";
import { Purchases } from "./pages/admin/purchases";
import { Rentals } from "./pages/admin/rentals";

const isLocalHostname = ["localhost", "127.0.0.1", "::1"].includes(
  window.location.hostname,
);
const configuredClerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains. Do not inline the env var, leave
// publishableKey undefined, or replace publishableKeyFromHost with anything else.
const clerkPubKey = isLocalHostname
  ? configuredClerkPubKey
  : publishableKeyFromHost(
      window.location.hostname,
      configuredClerkPubKey,
    );

// REQUIRED — copy verbatim. Empty in dev (Clerk hits dev FAPI directly), auto-set
// in prod. Do NOT gate on import.meta.env.PROD / NODE_ENV — the empty dev value
// is intentional, and any branching breaks the prod proxy.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
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
    colorPrimary: "hsl(32 35% 45%)",
    colorForeground: "hsl(24 15% 20%)",
    colorMutedForeground: "hsl(24 10% 45%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(40 25% 96%)",
    colorInput: "hsl(40 20% 92%)",
    colorInputForeground: "hsl(24 15% 20%)",
    colorNeutral: "hsl(32 20% 85%)",
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[hsl(40,25%,96%)] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[hsl(32,20%,85%)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-2xl text-[hsl(24,15%,20%)]",
    headerSubtitle: "text-[hsl(24,10%,45%)]",
    socialButtonsBlockButtonText: "text-[hsl(24,15%,20%)] font-medium",
    formFieldLabel: "text-[hsl(24,15%,20%)] font-medium",
    footerActionLink: "text-[hsl(32,35%,45%)] font-medium hover:text-[hsl(32,35%,35%)]",
    footerActionText: "text-[hsl(24,10%,45%)]",
    dividerText: "text-[hsl(24,10%,45%)]",
    identityPreviewEditButton: "text-[hsl(32,35%,45%)]",
    formFieldSuccessText: "text-[hsl(140,40%,35%)]",
    alertText: "text-[hsl(0,84%,45%)]",
    logoBox: "mb-2",
    logoImage: "h-9",
    socialButtonsBlockButton:
      "border border-[hsl(32,20%,85%)] hover:bg-[hsl(40,20%,90%)]",
    formButtonPrimary:
      "bg-[hsl(32,35%,45%)] hover:bg-[hsl(32,35%,38%)] text-[hsl(40,33%,98%)] rounded-full",
    formFieldInput:
      "bg-[hsl(40,20%,92%)] border border-[hsl(32,20%,85%)] text-[hsl(24,15%,20%)] rounded-lg",
    footerAction: "text-[hsl(24,10%,45%)]",
    dividerLine: "bg-[hsl(32,20%,85%)]",
    alert: "border border-[hsl(0,84%,60%)]/30 bg-[hsl(0,84%,60%)]/5",
    otpCodeFieldInput: "border border-[hsl(32,20%,85%)]",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

function AuthUnavailablePage() {
  return (
    <div className="min-h-[70dvh] bg-background px-4 py-20">
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="font-serif text-3xl text-foreground mb-4">Sign In</h1>
        <p className="text-muted-foreground leading-relaxed">
          Authentication is ready in the app, but this local environment needs a Clerk publishable key before the sign-in form can load.
        </p>
        <div className="mt-6 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Add <span className="font-mono text-foreground">VITE_CLERK_PUBLISHABLE_KEY</span> to the local frontend env.
        </div>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function LocalPortalLoginPage() {
  return <PortalLogin />;
}

function PublicRoutesWithoutClerk() {
  return (
    <WouterRouter base={basePath}>
      <PublicSiteRoutesWithoutClerk />
    </WouterRouter>
  );
}

function PublicSiteRoutesWithoutClerk() {
  return (
    <Switch>
      <Route path="/portal" component={Portal} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/:id" component={Checkout} />
      <Route path="/sign-in/*?" component={LocalPortalLoginPage} />
      <Route path="/sign-up/*?" component={LocalPortalLoginPage} />

      <Route>
        <Layout authEnabled={false}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/timetable" component={Timetable} />
            <Route path="/classes/:slug" component={ClassDetail} />
            <Route path="/classes" component={ClassesPage} />
            <Route path="/packages/:slug" component={PackageDetail} />
            <Route path="/packages" component={Packages} />
            <Route path="/team" component={Team} />
            <Route path="/rental" component={Rental} />

            <Route path="/admin" component={AuthUnavailablePage} />
            <Route path="/admin/students" component={AuthUnavailablePage} />
            <Route path="/admin/classes" component={AuthUnavailablePage} />
            <Route path="/admin/packages" component={AuthUnavailablePage} />
            <Route path="/admin/payments" component={AuthUnavailablePage} />
            <Route path="/admin/purchases" component={AuthUnavailablePage} />
            <Route path="/admin/rentals" component={AuthUnavailablePage} />

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

// Keeps the API client's react-query cache from leaking data across
// different signed-in users on the same device.
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

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue your practice",
          },
        },
        signUp: {
          start: {
            title: "Join the studio",
            subtitle: "Create your account to book classes",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <AuthenticatedSiteRoutes />
    </ClerkProvider>
  );
}

function AuthenticatedSiteRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/timetable" component={Timetable} />
        <Route path="/classes/:slug" component={ClassDetail} />
        <Route path="/classes" component={ClassesPage} />
        <Route path="/packages/:slug" component={PackageDetail} />
        <Route path="/packages" component={Packages} />
        <Route path="/team" component={Team} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/checkout/:id" component={Checkout} />
        <Route path="/rental" component={Rental} />
        <Route path="/portal" component={Portal} />

        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/students" component={Students} />
        <Route path="/admin/classes" component={Classes} />
        <Route path="/admin/packages" component={AdminPackages} />
        <Route path="/admin/payments" component={Payments} />
        <Route path="/admin/purchases" component={Purchases} />
        <Route path="/admin/rentals" component={Rentals} />

        {/* REQUIRED — copy "/sign-in/*?" and "/sign-up/*?" verbatim. */}
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  if (!clerkPubKey) {
    return <PublicRoutesWithoutClerk />;
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
