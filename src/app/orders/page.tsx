"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Package, CheckCircle2, ShoppingBag, Clock, X, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Feedback States
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt descending on the client to avoid needing a composite index
        ordersData.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }
    
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "cancelled"
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: "cancelled" } : order
      ));
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackOrderId || !user) return;
    
    setIsSubmittingFeedback(true);
    try {
      const order = orders.find(o => o.id === feedbackOrderId);
      
      // Save feedback
      await addDoc(collection(db, "feedbacks"), {
        orderId: feedbackOrderId,
        userId: user.uid,
        customerName: order?.customerInfo?.fullName || user.displayName || "Customer",
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      // Mark order as having feedback
      await updateDoc(doc(db, "orders", feedbackOrderId), {
        hasFeedback: true
      });

      // Update local state
      setOrders(orders.map(o => 
        o.id === feedbackOrderId ? { ...o, hasFeedback: true } : o
      ));
      
      setFeedbackOrderId(null);
      setRating(5);
      setComment("");
      alert("Thank you! Your feedback has been submitted successfully.");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen flex-col bg-pink-50">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "confirmed": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "processing": return "bg-indigo-500/20 text-indigo-500 border-indigo-500/30";
      case "packed": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "dispatched": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "delivered": return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      case "completed": return "bg-teal-500/20 text-teal-500 border-teal-500/30";
      case "cancelled": return "bg-red-500/20 text-red-500 border-red-500/30";
      default: return "bg-zinc-500/20 text-zinc-500 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock size={14} className="mr-1.5" />;
      case "confirmed": return <CheckCircle2 size={14} className="mr-1.5" />;
      case "processing": return <Package size={14} className="mr-1.5" />;
      case "packed": return <Package size={14} className="mr-1.5" />;
      case "dispatched": return <Package size={14} className="mr-1.5" />;
      case "delivered": return <CheckCircle2 size={14} className="mr-1.5" />;
      case "completed": return <CheckCircle2 size={14} className="mr-1.5" />;
      case "cancelled": return <X size={14} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-pink-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">My Orders</h1>
            <p className="text-zinc-9000">Track the status of your recent purchases</p>
          </div>
        </div>
        
        {loadingOrders ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white/50 p-12 text-center backdrop-blur-sm">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white border border-zinc-200">
              <ShoppingBag className="h-10 w-10 text-zinc-9000" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-zinc-900">No orders yet</h2>
            <p className="mb-8 text-zinc-9000 max-w-sm">When you place an order, you'll be able to track its status here.</p>
            <Link href="/">
              <Button className="bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.3)]">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 shadow-md backdrop-blur-sm transition-all hover:border-pink-500/30"
              >
                <div className="border-b border-zinc-200 bg-white/50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                    <div>
                      <p className="text-zinc-9000 mb-0.5">Order ID</p>
                      <p className="font-mono text-zinc-700">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-zinc-9000 mb-0.5">Date</p>
                      <p className="text-zinc-700">
                        {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-9000 mb-0.5">Total Amount</p>
                      <p className="font-bold text-pink-600">Rs. {order.totalPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 items-center gap-3">
                    {(!order.status || order.status.toLowerCase() === 'pending') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      >
                        Cancel Order
                      </Button>
                    )}
                    {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed') && !order.hasFeedback && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFeedbackOrderId(order.id)}
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 border-pink-200"
                      >
                        Leave Feedback
                      </Button>
                    )}
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <h4 className="mb-4 text-sm font-semibold text-zinc-9000 uppercase tracking-wider">Items in your order</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 rounded-xl border border-zinc-200/50 bg-zinc-50/40 p-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                          {item.customizedImage ? (
                            <img src={item.customizedImage} alt={item.name} className="h-full w-full object-cover" />
                          ) : item.image || item.imageUrl ? (
                            <Image src={item.image || item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden py-1">
                          <p className="truncate font-medium text-zinc-200">{item.name}</p>
                          <p className="mt-1 text-sm text-zinc-9000">Qty: {item.quantity}</p>
                          <p className="mt-auto font-medium text-pink-600">
                            Rs. {(item.price * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Feedback Modal */}
      {feedbackOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setFeedbackOrderId(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900">Leave Feedback</h3>
              <Button variant="ghost" size="sm" onClick={() => setFeedbackOrderId(null)} className="h-8 w-8 rounded-full p-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
                <X size={18} />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="mb-2 block text-sm font-medium text-zinc-700">Comments (Optional)</label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved about your order..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setFeedbackOrderId(null)}>Cancel</Button>
                <Button 
                  onClick={handleSubmitFeedback} 
                  disabled={isSubmittingFeedback}
                  className="bg-pink-600 text-white hover:bg-pink-700"
                >
                  {isSubmittingFeedback ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : "Submit Feedback"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
