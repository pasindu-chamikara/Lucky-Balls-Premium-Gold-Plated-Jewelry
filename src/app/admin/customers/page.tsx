"use client";

import { useState, useEffect } from "react";
import { Users, Search, ShoppingBag } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Customer {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: any;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const ordersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        
        const customerMap = new Map<string, Customer>();

        ordersSnap.docs.forEach(document => {
          const data = document.data();
          const info = data.customerInfo;
          
          if (!info) return;

          // Use email as unique identifier, fallback to phone or ID
          const identifier = info.email || info.phone || data.userId || document.id;
          
          if (customerMap.has(identifier)) {
            const existing = customerMap.get(identifier)!;
            existing.totalOrders += 1;
            if (data.status !== "cancelled") {
              existing.totalSpent += (data.totalPrice || 0);
            }
            if (!existing.lastOrderDate && data.createdAt) {
              existing.lastOrderDate = data.createdAt;
            }
          } else {
            customerMap.set(identifier, {
              id: identifier,
              userId: data.userId || null,
              fullName: info.fullName || 'Unknown',
              email: info.email || 'N/A',
              phone: info.phone || 'N/A',
              address: info.address || 'N/A',
              totalOrders: 1,
              totalSpent: data.status !== "cancelled" ? (data.totalPrice || 0) : 0,
              lastOrderDate: data.createdAt || null
            });
          }
        });
        
        setCustomers(Array.from(customerMap.values()));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    searchQuery === "" || 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <AdminLayout title="Customers">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Customer Directory</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and view all customer profiles from guest and registered checkouts.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Users size={20} className="text-pink-500" />
            All Customers ({customers.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm text-zinc-900 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-white text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium text-center">Total Orders</th>
                <th className="px-6 py-4 font-medium text-right">Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold text-sm">
                          {customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{customer.fullName}</p>
                          <p className="text-xs text-zinc-500">{customer.userId ? 'Registered User' : 'Guest'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-900">{customer.email}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-[200px] truncate text-zinc-600" title={customer.address}>
                        {customer.address}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                        <ShoppingBag size={12} />
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-pink-600">Rs. {customer.totalSpent.toFixed(2)}</p>
                      {customer.lastOrderDate && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Last active: {new Date(customer.lastOrderDate.toDate()).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
