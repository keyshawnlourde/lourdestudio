import { Link, useLocation, Redirect } from "wouter";
import { Show } from "@clerk/react";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
      <Show when="signed-in">
        <AdminGate>{children}</AdminGate>
      </Show>
    </>
  );
}

function AdminGate({ children }: AdminLayoutProps) {
  const { data: profile, isLoading } = useGetMyProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <AdminShell>{children}</AdminShell>;
}

function AdminShell({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/classes", label: "Classes" },
    { href: "/admin/packages", label: "Packages" },
    { href: "/admin/payments", label: "Payment Methods" },
    { href: "/admin/purchases", label: "Purchases" },
    { href: "/admin/rentals", label: "Rentals" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r flex flex-col shrink-0">
        <div className="p-6 border-b">
          <h2 className="font-serif text-2xl text-primary">Admin</h2>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}