"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Tags, Package, ClipboardList, MessageSquare, Users, Mail, Bell, X } from "lucide-react";
import Link from "next/link";

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
};

const navigation = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/bookings", icon: ClipboardList },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: Mail },
  { name: "Feedback", href: "/admin/feedbacks", icon: MessageSquare },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, href: string}[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user exists in the 'admins' Firestore collection
          const adminDocRef = doc(db, "admins", user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            setLoading(false); 
          } else {
            console.warn("User is not an admin, signing out...");
            await signOut(auth);
            router.push("/");
          }
        } catch (error) {
          console.error("Error verifying admin status:", error);
          await signOut(auth);
          router.push("/admin/login");
        }
      } else {
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const startTime = Date.now();

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          if (createdAt > startTime) {
            addNotification("New Order!", `Order #${change.doc.id} was just placed.`, "/admin/bookings");
          }
        }
      });
    });

    const unsubscribeMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          if (createdAt > startTime) {
            addNotification("New Message!", `${data.name || 'A customer'} sent a new message.`, "/admin/messages");
          }
        }
      });
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMessages();
    };
  }, [loading]);

  const addNotification = (title: string, message: string, href: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, href }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          <p className="text-zinc-500 font-medium tracking-wide">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200/60 bg-white hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
            Lucky Balls
          </Link>
          <p className="text-xs font-medium text-zinc-400 mt-1 uppercase tracking-widest">Admin Workspace</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-pink-50 text-pink-700" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-pink-600" : "text-zinc-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-2 text-zinc-600 hover:text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header (minimal) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
          <p className="font-bold text-pink-600">Admin Workspace</p>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut size={16} /></Button>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{title}</h1>
          </div>
          {children}
        </div>
      </main>

      {/* Notifications Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {notifications.map(note => (
          <div key={note.id} className="bg-white border border-zinc-200 shadow-xl rounded-xl p-4 w-80 flex gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 flex-shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-zinc-900">{note.title}</h4>
              <p className="text-xs text-zinc-500 mt-1">{note.message}</p>
              <Link href={note.href} className="text-xs font-medium text-pink-600 hover:text-pink-700 mt-2 inline-block">
                View Details &rarr;
              </Link>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))} className="text-zinc-400 hover:text-zinc-600 self-start">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
