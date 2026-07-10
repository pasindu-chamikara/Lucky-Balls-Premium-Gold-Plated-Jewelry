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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const addNotification = (title: string, message: string, href: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, href }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent"></div>
          <p className="text-zinc-500 font-medium tracking-wide">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-zinc-200/60 bg-white hidden md:flex flex-col z-20">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-zinc-900">
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
                    ? "bg-white shadow-sm border border-zinc-200/60 text-zinc-900" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon size={18} />
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
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-4 flex items-center justify-between border-b border-zinc-100">
              <div>
                <p className="text-lg font-bold text-zinc-900">Lucky Balls</p>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Admin Workspace</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="h-8 w-8 p-0 rounded-full">
                <X size={18} />
              </Button>
            </div>
            
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-semibold ${
                      isActive 
                        ? "bg-white shadow-sm border border-zinc-200/60 text-zinc-900" 
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-zinc-900" : "text-zinc-400"} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50">
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-center gap-2 text-zinc-600 border-zinc-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 bg-white"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Mobile Header (minimal) */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b bg-white/90 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-0 h-auto text-zinc-700" onClick={() => setIsMobileMenuOpen(true)}>
              <div className="space-y-1.5">
                <span className="block w-5 h-0.5 bg-current rounded-full"></span>
                <span className="block w-4 h-0.5 bg-current rounded-full"></span>
                <span className="block w-5 h-0.5 bg-current rounded-full"></span>
              </div>
            </Button>
            <p className="font-bold text-zinc-900 text-sm">Admin Workspace</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 w-8 p-0 rounded-full text-zinc-500 hover:text-rose-600"><LogOut size={16} /></Button>
        </div>

        <div className="mx-auto w-full px-4 py-6 md:px-6 md:py-10 lg:px-8">
          <div className="mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">{title}</h1>
          </div>
          {children}
        </div>
      </main>

      {/* Notifications Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map(note => (
          <div key={note.id} className="bg-white border border-zinc-200 shadow-xl rounded-xl p-4 w-72 md:w-80 flex gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-rose-600 flex-shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-zinc-900">{note.title}</h4>
              <p className="text-xs text-zinc-500 mt-1">{note.message}</p>
              <Link href={note.href} className="text-xs font-medium text-rose-600 hover:text-rose-600 mt-2 inline-block">
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
