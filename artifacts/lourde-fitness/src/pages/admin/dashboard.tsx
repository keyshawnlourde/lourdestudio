import { AdminLayout } from "./layout";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Loader2, Users, Calendar, DollarSign, PackageOpen, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-2">Overview</h1>
        <p className="text-muted-foreground">Studio performance and pending actions.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Total Students</h3>
          <div className="font-serif text-3xl">{summary?.totalStudents || 0}</div>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Confirmed Revenue</h3>
          <div className="font-serif text-3xl">${Number(summary?.confirmedRevenue || 0).toFixed(2)}</div>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Upcoming Classes</h3>
          <div className="font-serif text-3xl">{summary?.upcomingClassCount || 0}</div>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <PackageOpen className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Pending Rentals</h3>
          <div className="font-serif text-3xl">{summary?.pendingRentals || 0}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-amber-500/5">
            <h3 className="font-medium text-amber-700">Pending Purchases</h3>
            <Link href="/admin/purchases" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="p-6 flex items-center justify-center min-h-[150px]">
            <div className="text-center">
              <div className="font-serif text-5xl mb-2 text-amber-600">{summary?.pendingPurchases || 0}</div>
              <p className="text-sm text-muted-foreground">Require your review</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-blue-500/5">
            <h3 className="font-medium text-blue-700">Pending Rentals</h3>
            <Link href="/admin/rentals" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="p-6 flex items-center justify-center min-h-[150px]">
            <div className="text-center">
              <div className="font-serif text-5xl mb-2 text-blue-600">{summary?.pendingRentals || 0}</div>
              <p className="text-sm text-muted-foreground">Awaiting approval</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}