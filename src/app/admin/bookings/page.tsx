"use client";

import { useState, useEffect } from "react";
import { Box, Package, CheckCircle, Eye, X, Search, Settings, Truck, Ban } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminBookingsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  const ORDER_STATUSES = ['all', 'pending', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'completed', 'cancelled'];
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "confirmed": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "processing": return "bg-indigo-500/20 text-indigo-600 border-indigo-500/30";
      case "packed": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "dispatched": return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "delivered": return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
      case "completed": return "bg-teal-500/20 text-teal-600 border-teal-500/30";
      case "cancelled": return "bg-red-500/20 text-red-600 border-red-500/30";
      default: return "bg-zinc-500/20 text-zinc-600 border-zinc-500/30";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch = activeSearchQuery === "" || 
      order.id.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
      order.customerInfo?.fullName?.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      order.customerInfo?.email?.toLowerCase().includes(activeSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        
        const ordersData = ordersSnap.docs.map(document => {
          return {
            id: document.id,
            ...document.data()
          };
        });
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
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
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const renderNextAction = (order: any) => {
    if (!order.status || order.status === 'pending') {
      return (
        <Button variant="custom" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs flex items-center gap-1">
          <CheckCircle size={14} /> Confirm
        </Button>
      );
    }
    if (order.status === 'confirmed') {
      return (
        <Button variant="custom" onClick={() => handleUpdateOrderStatus(order.id, 'processing')} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-xs flex items-center gap-1">
          <Settings size={14} /> Process
        </Button>
      );
    }
    if (order.status === 'processing') {
      return (
        <Button variant="custom" onClick={() => handleUpdateOrderStatus(order.id, 'packed')} size="sm" className="bg-purple-500 hover:bg-purple-600 text-white h-8 text-xs flex items-center gap-1">
          <Box size={14} /> Pack
        </Button>
      );
    }
    if (order.status === 'packed') {
      return (
        <Button variant="custom" onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs flex items-center gap-1">
          <Truck size={14} /> Dispatch
        </Button>
      );
    }
    if (order.status === 'dispatched') {
      return (
        <Button variant="custom" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs flex items-center gap-1">
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
        variant="rose-outline"
        className="h-8 text-xs flex items-center gap-1"
      >
        <Ban size={14} /> Cancel
      </Button>
    );
  };

  return (
    <AdminLayout title="Orders">
      {/* All Orders Section */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            All Bookings
          </h2>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by ID, name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveSearchQuery(searchQuery)}
                  className="pl-9 pr-4 py-1.5 text-sm text-zinc-900 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <Button variant="default" size="sm" onClick={() => setActiveSearchQuery(searchQuery)} className="shrink-0">
                Search
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
            {ORDER_STATUSES.map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className={`capitalize ${filter === status ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'text-zinc-600'}`}
              >
                {status}
              </Button>
            ))}
            </div>
          </div>
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
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No bookings found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                    <td className="px-6 py-4">{order.customerInfo?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">Rs. {order.totalPrice?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize border ${getStatusColor(order.status)}`}>
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
                        className="text-zinc-500 hover:text-rose-600 hover:bg-pink-50 h-8 text-xs flex items-center gap-1"
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
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-600 bg-pink-50 inline-block px-2 py-0.5 rounded-full mt-2">
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
                <span className="text-2xl font-bold text-rose-600">Rs. {selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl">
              <h4 className="text-sm font-semibold text-zinc-900 mb-4">Update Order Status</h4>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.filter(s => s !== 'all').map((status) => (
                  <Button 
                    key={status}
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, status);
                      setSelectedOrder({...selectedOrder, status});
                    }}
                    variant={selectedOrder.status === status ? "default" : "outline"}
                    size="sm"
                    className={`capitalize ${selectedOrder.status === status ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
