import { useState } from "react";
import { AdminLayout } from "./layout";
import { useListPurchases, useReviewPurchase, useListStudents } from "@workspace/api-client-react";
import { Loader2, Check, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export function Purchases() {
  const { data: purchases, isLoading, refetch } = useListPurchases();
  const { data: students } = useListStudents();
  const reviewPurchase = useReviewPurchase();

  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "pending" | "confirmed" | "rejected">("pending");

  const filteredPurchases = purchases?.filter(p => statusFilter === "ALL" || p.status === statusFilter) || [];

  const handleReview = async (id: number, status: "confirmed" | "rejected") => {
    try {
      await reviewPurchase.mutateAsync({
        id,
        data: {
          status,
          reviewNotes: reviewNotes || undefined
        }
      });
      setReviewingId(null);
      setReviewNotes("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1">Purchases</h1>
          <p className="text-muted-foreground">Review payment receipts and credit accounts.</p>
        </div>
        
        <div className="flex gap-2">
          {["pending", "confirmed", "rejected", "ALL"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-medium transition-colors ${
                statusFilter === status ? "bg-primary text-primary-foreground" : "bg-card border text-muted-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex py-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & ID</th>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Package</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Receipt</th>
                  <th className="px-6 py-4 font-medium text-right">Status/Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPurchases.map(purchase => {
                  const student = students?.find(s => s.id === purchase.studentId);
                  
                  return (
                    <tr key={purchase.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium whitespace-nowrap">{format(parseISO(purchase.submittedAt), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground mt-1">#{purchase.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{student?.name || `Student #${purchase.studentId}`}</div>
                        <div className="text-xs text-muted-foreground mt-1">{student?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{purchase.packageName}</div>
                      </td>
                      <td className="px-6 py-4 font-serif text-lg">
                        ${Number(purchase.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={purchase.screenshotObjectPath?.startsWith('http') ? purchase.screenshotObjectPath : `/api/storage/objects/${purchase.screenshotObjectPath}`} 
                          target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg"
                        >
                          <FileImage className="w-4 h-4" /> View
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {purchase.status === "pending" ? (
                          reviewingId === purchase.id ? (
                            <div className="flex flex-col gap-2 items-end min-w-[200px]">
                              <input 
                                type="text" 
                                placeholder="Review notes (optional)" 
                                className="w-full text-xs p-2 border rounded bg-background"
                                value={reviewNotes}
                                onChange={e => setReviewNotes(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleReview(purchase.id, "confirmed")}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleReview(purchase.id, "rejected")}>
                                  Reject
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => setReviewingId(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => setReviewingId(purchase.id)}>Review</Button>
                          )
                        ) : (
                          <div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs uppercase tracking-wider font-medium
                              ${purchase.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {purchase.status}
                            </span>
                            {purchase.reviewNotes && (
                              <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate ml-auto" title={purchase.reviewNotes}>
                                Note: {purchase.reviewNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No purchases found matching this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}