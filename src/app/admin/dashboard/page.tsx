"use client";

import { useState, useEffect } from "react";
import { Activity, Box, ShoppingBag, Users, TrendingUp, Package, Layers, CheckCircle, Eye, X, Settings, MessageSquare, Star, Truck, Ban } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingFee, setShippingFee] = useState<number | string>(0);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30";
      case "confirmed": return "bg-blue-500/20 text-blue-600 border border-blue-500/30";
      case "processing": return "bg-indigo-500/20 text-indigo-600 border border-indigo-500/30";
      case "packed": return "bg-purple-500/20 text-purple-600 border border-purple-500/30";
      case "dispatched": return "bg-orange-500/20 text-orange-600 border border-orange-500/30";
      case "delivered": return "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30";
      case "completed": return "bg-teal-500/20 text-teal-600 border border-teal-500/30";
      case "cancelled": return "bg-red-500/20 text-red-600 border border-red-500/30";
      default: return "bg-zinc-500/20 text-zinc-600 border border-zinc-500/30";
    }
  };
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsSnap, categoriesSnap, ordersSnap, configSnap, feedbacksSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "categories")),
          getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
          getDoc(doc(db, "settings", "store_config")),
          getDocs(query(collection(db, "feedbacks"), orderBy("createdAt", "desc")))
        ]);
        
        setProductCount(productsSnap.size);
        setCategoryCount(categoriesSnap.size);
        
        const lowStock: any[] = [];
        productsSnap.forEach(doc => {
          const data = doc.data();
          if (data.stockQuantity !== undefined && data.stockQuantity <= 5 && !data.isOutOfStock) {
            lowStock.push({ id: doc.id, ...data });
          }
        });
        setLowStockProducts(lowStock);
        
        if (configSnap.exists()) {
          setShippingFee(configSnap.data().shippingFee || 0);
        }
        
        let revenue = 0;
        let activeCount = 0;
        const ordersData = ordersSnap.docs.map(document => {
          const data = document.data();
          if (data.status !== "cancelled") {
            revenue += data.totalPrice || 0;
          }
          if (data.status === "pending" || data.status === "confirmed") {
            activeCount++;
          }
          return {
            id: document.id,
            ...data
          };
        });
        
        
        const feedbacksData = feedbacksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeedbacks(feedbacksData);
        setTotalRevenue(revenue);
        setActiveOrders(activeCount);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus
      });
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (newStatus === "received") {
         setActiveOrders(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const stats = [
    { label: "Total Revenue", value: loading ? "..." : `Rs. ${totalRevenue.toFixed(2)}`, icon: Activity, trend: "Live" },
    { label: "Active Orders", value: loading ? "..." : activeOrders.toString(), icon: ShoppingBag, trend: "Live" },
    { label: "Total Products", value: loading ? "..." : productCount.toString(), icon: Box, trend: "Live" },
    { label: "Categories", value: loading ? "..." : categoryCount.toString(), icon: Layers, trend: "Live" },
  ];

  const renderNextAction = (order: any) => {
    if (!order.status || order.status === 'pending') {
      return (
        <Button onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs flex items-center gap-1">
          <CheckCircle size={14} /> Confirm
        </Button>
      );
    }
    if (order.status === 'confirmed') {
      return (
        <Button onClick={() => handleUpdateOrderStatus(order.id, 'processing')} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-xs flex items-center gap-1">
          <Settings size={14} /> Process
        </Button>
      );
    }
    if (order.status === 'processing') {
      return (
        <Button onClick={() => handleUpdateOrderStatus(order.id, 'packed')} size="sm" className="bg-purple-500 hover:bg-purple-600 text-white h-8 text-xs flex items-center gap-1">
          <Box size={14} /> Pack
        </Button>
      );
    }
    if (order.status === 'packed') {
      return (
        <Button onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs flex items-center gap-1">
          <Truck size={14} /> Dispatch
        </Button>
      );
    }
    if (order.status === 'dispatched') {
      return (
        <Button onClick={() => handleUpdateOrderStatus(order.id, 'delivered')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs flex items-center gap-1">
          <Package size={14} /> Deliver
        </Button>
      );
    }
    return null;
  };

  const renderCancelAction = (order: any) => {
    if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'completed') return null;
    return (
      <Button 
        onClick={() => {
          if (confirm('Are you sure you want to cancel this order?')) {
            handleUpdateOrderStatus(order.id, 'cancelled');
          }
        }}
        size="sm" 
        variant="outline"
        className="text-rose-500 border-rose-200 hover:bg-rose-50 h-8 text-xs flex items-center gap-1"
      >
        <Ban size={14} /> Cancel
      </Button>
    );
  };

  return (
    <AdminLayout title="Overview Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${stat.trend === 'Live' ? 'bg-pink-50 text-pink-600' : 'bg-zinc-100 text-zinc-600'}`}>
                  {stat.trend !== 'Live' && <TrendingUp size={14} />}
                  {stat.trend}
                </span>
                <span className="text-zinc-400">{stat.trend === 'Live' ? 'From database' : 'No data yet'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="mt-10 rounded-2xl border border-red-200/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-red-100 bg-red-50/50 px-6 py-4 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-lg font-semibold text-red-900">Low Stock Alerts</h2>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-zinc-100">
              {lowStockProducts.map(product => (
                <li key={product.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-zinc-200">
                      <img src={product.image || "/images/gift-basket.svg"} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{product.name}</p>
                      <p className="text-sm font-semibold text-red-600 mt-0.5">Only {product.stockQuantity} left in stock</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/products'} className="border-red-200 text-red-600 hover:bg-red-50">
                    Manage Stock
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Store Settings Section */}
      <div className="mt-10 rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Settings size={20} className="text-pink-500" />
          Store Configuration
        </h2>
        
        <div className="flex items-end gap-4 max-w-sm">
          <div className="flex-1">
            <label htmlFor="shippingFee" className="block text-sm font-medium text-zinc-600 mb-1">
              Standard Shipping Fee ($)
            </label>
            <input
              id="shippingFee"
              type="number"
              min="0"
              step="0.01"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <Button 
            onClick={async () => {
              setIsUpdatingShipping(true);
              try {
                const feeValue = parseFloat(shippingFee as string) || 0;
                await setDoc(doc(db, "settings", "store_config"), { shippingFee: feeValue }, { merge: true });
                setShippingFee(feeValue);
                alert("Shipping fee updated successfully!");
              } catch (error) {
                console.error("Error updating shipping fee:", error);
                alert("Failed to update shipping fee.");
              } finally {
                setIsUpdatingShipping(false);
              }
            }}
            disabled={isUpdatingShipping}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isUpdatingShipping ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mt-10 rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Package size={20} className="text-pink-500" />
            Recent Orders
          </h2>
          <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50">View All</Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-white text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                    <td className="px-6 py-4">{order.customerInfo?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">Rs. {order.totalPrice?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {renderCancelAction(order)}
                      {renderNextAction(order)}
                      <Button 
                        onClick={() => setSelectedOrder(order)}
                        size="sm" 
                        variant="ghost"
                        className="text-zinc-500 hover:text-pink-600 hover:bg-pink-50 h-8 text-xs flex items-center gap-1"
                      >
                        <Eye size={14} /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Feedback Section */}
      <div className="mt-10 rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-pink-500" />
            Customer Feedback
          </h2>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading feedbacks...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No feedback has been submitted yet.</div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {feedbacks.slice(0, 5).map(fb => (
                <li key={fb.id} className="p-6 hover:bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold">
                        {fb.customerName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{fb.customerName}</p>
                        <p className="text-xs text-zinc-500 font-mono">Order #{fb.orderId}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} className={star <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"} />
                      ))}
                    </div>
                  </div>
                  {fb.comment && (
                    <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-100 p-3 rounded-lg italic">
                      "{fb.comment}"
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-3">
                    {fb.createdAt ? new Date(fb.createdAt.toDate()).toLocaleString() : 'Just now'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Booking Details <span className="text-zinc-400 font-normal text-sm ml-2">#{selectedOrder.id}</span></h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="h-8 w-8 p-0 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100">
                <X size={18} />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Customer Info */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Customer Information</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                  <div>
                    <p className="text-zinc-500 mb-1">Full Name</p>
                    <p className="font-medium text-zinc-900">{selectedOrder.customerInfo?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">Email</p>
                    <p className="font-medium text-zinc-900">{selectedOrder.customerInfo?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">Phone</p>
                    <p className="font-medium text-zinc-900">{selectedOrder.customerInfo?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">Address</p>
                    <p className="font-medium text-zinc-900">
                      {selectedOrder.customerInfo?.address ? 
                        `${selectedOrder.customerInfo.address}, ${selectedOrder.customerInfo.city} ${selectedOrder.customerInfo.postalCode}` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ordered Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 border border-zinc-200/60 rounded-xl p-3 bg-white">
                      {item.customizedImage ? (
                        <img src={item.customizedImage} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-zinc-100" />
                      ) : (item.imageUrl || item.image) ? (
                        <img src={item.imageUrl || item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-zinc-100" />
                      ) : (
                        <div className="w-20 h-20 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                          <Box size={24} className="text-zinc-300" />
                        </div>
                      )}
                      
                      <div className="flex-1 py-1">
                        <h5 className="font-medium text-zinc-900">{item.name}</h5>
                        <p className="text-sm text-zinc-500 mt-1">Qty: {item.quantity} × Rs. {item.price?.toFixed(2) || '0.00'}</p>
                        {item.category && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-pink-600 bg-pink-50 inline-block px-2 py-0.5 rounded-full mt-2">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-zinc-900 py-1">
                        Rs. {((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <p className="text-zinc-500 text-sm italic">No items found for this order.</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
                <span className="font-medium text-zinc-600">Total Price</span>
                <span className="text-2xl font-bold text-pink-600">Rs. {selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>

              {/* Feedback Summary (if exists) */}
              {(() => {
                const orderFeedback = feedbacks.find(fb => fb.orderId === selectedOrder.id);
                if (orderFeedback) {
                  return (
                    <div className="mt-6 border border-yellow-200 bg-yellow-50/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Customer Feedback</h4>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={14} className={star <= orderFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-yellow-200"} />
                          ))}
                        </div>
                      </div>
                      {orderFeedback.comment && (
                        <p className="text-sm text-yellow-900 mt-2 italic">"{orderFeedback.comment}"</p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl flex justify-end">
              <Button onClick={() => setSelectedOrder(null)} className="bg-zinc-900 text-white hover:bg-zinc-800">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
