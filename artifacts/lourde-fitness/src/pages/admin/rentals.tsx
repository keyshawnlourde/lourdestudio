import { useState } from "react";
import { AdminLayout } from "./layout";
import { useListRentals, useReviewRental } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export function Rentals() {
  const { data: rentals, isLoading, refetch } = useListRentals();
  const reviewRental = useReviewRental();

  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("PENDING");

  const filteredRentals = rentals?.filter(r => statusFilter === "ALL" || r.status.toUpperCase() === statusFilter) || [];

  const handleReview = async (id: number, status: "confirmed" | "rejected") => {
    try {
      await reviewRental.mutateAsync({
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
          <h1 className="font-serif text-3xl mb-1">Studio Rentals</h1>
          <p className="text-muted-foreground">Manage private bookings and inquiries.</p>
        </div>
        
        <div className="flex gap-2">
          {["PENDING", "CONFIRMED", "REJECTED", "ALL"].map(status => (
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
                  <th className="px-6 py-4 font-medium">Requested Time</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium max-w-[200px]">Purpose</th>
                  <th className="px-6 py-4 font-medium text-right">Status/Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRentals.map(rental => {
                  return (
                    <tr key={rental.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium whitespace-nowrap">{format(parseISO(rental.date), 'EEEE, MMM d, yyyy')}</div>
                        <div className="text-muted-foreground mt-1">{rental.startTime} - {rental.endTime}</div>
                        <div className="text-xs text-muted-foreground mt-1">Requested {format(parseISO(rental.createdAt), 'MMM d')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{rental.requesterName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <div>{rental.email}</div>
                          <div>{rental.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[250px] whitespace-pre-wrap">
                        {rental.purpose}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {rental.status === "pending" ? (
                          reviewingId === rental.id ? (
                            <div className="flex flex-col gap-2 items-end min-w-[200px]">
                              <input 
                                type="text" 
                                placeholder="Response note (will email user in real app)" 
                                className="w-full text-xs p-2 border rounded bg-background"
                                value={reviewNotes}
                                onChange={e => setReviewNotes(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleReview(rental.id, "confirmed")}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleReview(rental.id, "rejected")}>
                                  Reject
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => setReviewingId(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => setReviewingId(rental.id)}>Review</Button>
                          )
                        ) : (
                          <div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs uppercase tracking-wider font-medium
                              ${rental.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {rental.status}
                            </span>
                            {rental.reviewNotes && (
                              <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate ml-auto" title={rental.reviewNotes}>
                                Note: {rental.reviewNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredRentals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No rental requests found matching this filter.
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