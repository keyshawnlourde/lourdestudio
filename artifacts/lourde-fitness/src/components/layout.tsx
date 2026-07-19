import { Link, useLocation } from "wouter";
import { Show, useAuth, useClerk } from "@clerk/react";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type LayoutProps = {
  children: React.ReactNode;
  authEnabled?: boolean;
};

function LogOutButton({ className }: { className?: string }) {
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: basePath || "/" })}
      className={className}
    >
      Log out
    </button>
  );
}

function AdminNavLink({
  location,
  onNavigate,
}: {
  location: string;
  onNavigate?: () => void;
}) {
  const { data: profile } = useGetMyProfile();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className={`transition-colors hover:text-primary ${location.startsWith("/admin") ? "text-foreground" : "text-muted-foreground"}`}
    >
      Admin
    </Link>
  );
}

function DesktopAuthActions() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {(!isLoaded || !isSignedIn) && (
        <Link href="/sign-in">
          <Button variant="outline" className="font-serif rounded-full px-6">Sign In</Button>
        </Link>
      )}
      <Show when="signed-in">
        <Link href="/portal" className="text-sm font-medium hover:text-primary transition-colors px-4">
          My Portal
        </Link>
        <LogOutButton className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" />
      </Show>
    </div>
  );
}

function MobileAuthActions({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="pt-4 border-t flex flex-col gap-4">
      {(!isLoaded || !isSignedIn) && (
        <Link href="/sign-in" onClick={onNavigate}>
          <Button variant="outline" className="w-full">Sign In</Button>
        </Link>
      )}
      <Show when="signed-in">
        <Link href="/portal" onClick={onNavigate}>
          <Button variant="ghost" className="w-full justify-start">My Portal</Button>
        </Link>
        <LogOutButton className="text-left text-sm text-muted-foreground hover:text-primary px-4" />
      </Show>
    </div>
  );
}

function getLocalPortalEmail() {
  const raw = window.localStorage.getItem("lourde.portalSession");
  if (!raw) return "";

  try {
    return (JSON.parse(raw) as { email?: string }).email ?? "";
  } catch {
    return "";
  }
}

function LocalAuthActions({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [email, setEmail] = useState(getLocalPortalEmail);

  useEffect(() => {
    const updateEmail = () => setEmail(getLocalPortalEmail());
    window.addEventListener("lourde-auth-changed", updateEmail);
    window.addEventListener("storage", updateEmail);
    return () => {
      window.removeEventListener("lourde-auth-changed", updateEmail);
      window.removeEventListener("storage", updateEmail);
    };
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("lourde.portalSession");
    window.dispatchEvent(new Event("lourde-auth-changed"));
    setEmail("");
    onNavigate?.();
  };

  if (!email) {
    return (
      <Link href="/sign-in" onClick={onNavigate}>
        <Button
          variant="outline"
          className={mobile ? "w-full" : "font-serif rounded-full px-6"}
        >
          Sign In
        </Button>
      </Link>
    );
  }

  if (mobile) {
    return (
      <div className="pt-4 border-t flex flex-col gap-3">
        <Link href="/portal" onClick={onNavigate}>
          <Button variant="ghost" className="w-full justify-start">My Portal</Button>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-left text-sm text-muted-foreground hover:text-primary px-4"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/portal" className="text-sm font-medium hover:text-primary transition-colors">
        My Portal
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        Log out
      </button>
    </div>
  );
}

export function Layout({ children, authEnabled = true }: LayoutProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [localPortalEmail, setLocalPortalEmail] = useState(getLocalPortalEmail);

  useEffect(() => {
    const updateEmail = () => setLocalPortalEmail(getLocalPortalEmail());
    window.addEventListener("lourde-auth-changed", updateEmail);
    window.addEventListener("storage", updateEmail);
    return () => {
      window.removeEventListener("lourde-auth-changed", updateEmail);
      window.removeEventListener("storage", updateEmail);
    };
  }, []);

  const localPortalSignedIn = !authEnabled && Boolean(localPortalEmail);
  const navLinks = localPortalSignedIn
    ? [
        { href: "/portal", label: "Portal" },
        { href: "/timetable", label: "Timetable" },
        { href: "/classes", label: "Add Credits" },
      ]
    : [
        { href: "/timetable", label: "Timetable" },
        { href: "/classes", label: "Classes" },
        { href: "/team", label: "Team" },
        { href: "/rental", label: "Studio Rental" },
      ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-semibold tracking-wide">Lourde</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-primary ${location.startsWith(link.href) ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
              {authEnabled && <AdminNavLink location={location} />}
            </nav>

            {authEnabled ? (
              <DesktopAuthActions />
            ) : (
              <LocalAuthActions />
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-b bg-background px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4 font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              {authEnabled && (
                <AdminNavLink
                  location={location}
                  onNavigate={() => setMenuOpen(false)}
                />
              )}
            </nav>
            {authEnabled ? (
              <MobileAuthActions onNavigate={() => setMenuOpen(false)} />
            ) : (
              <LocalAuthActions mobile onNavigate={() => setMenuOpen(false)} />
            )}
          </div>
        )}
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <footer className="border-t bg-muted/40 py-12 mt-auto">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-2xl font-medium mb-4">Lourde</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              An elevated space for movement, strength, and grace. Specializing in pole and dance fitness.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@lourdestudio.com</li>
              <li>@lourdefitness</li>
              <li>123 Movement Way, Studio City</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
