"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { MessageSquare, Star, Trash2, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await deleteDoc(doc(db, "feedbacks", id));
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback.");
    }
  };

  return (
    <AdminLayout title="Customer Feedbacks">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Customer Feedbacks</h1>
          <p className="text-sm text-zinc-500 mt-1">Review all feedback submitted by your customers.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-rose-600" />
          <h2 className="font-semibold text-zinc-900">All Feedbacks ({feedbacks.length})</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <MessageSquare size={24} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900">No Feedback Yet</h3>
            <p className="text-sm text-zinc-500 mt-1">When customers leave feedback, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {feedbacks.map(fb => (
              <div key={fb.id} className="p-6 transition-colors hover:bg-zinc-50/50">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-rose-600 font-bold text-lg">
                          {fb.customerName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{fb.customerName}</p>
                          <p className="text-xs text-zinc-500 font-mono">Order #{fb.orderId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
                          <Calendar size={14} />
                          {fb.createdAt ? new Date(fb.createdAt.toDate()).toLocaleDateString() : 'Unknown Date'}
                        </div>
                        <Button 
                          variant="danger-ghost" 
                          size="sm" 
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="h-8 w-8 p-0"
                          title="Delete Feedback"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={18} 
                          className={star <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"} 
                        />
                      ))}
                    </div>
                    
                    {fb.comment ? (
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm text-zinc-700 italic">
                        "{fb.comment}"
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">No comment provided.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
