"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, X } from "lucide-react";
import Link from "next/link";

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
};

const navigation = [
  { name: "Overview", href: "/admin/dashboard" },
  { name: "Orders", href: "/admin/bookings" },
  { name: "Categories", href: "/admin/categories" },
  { name: "Products", href: "/admin/products" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Messages", href: "/admin/messages" },
  { name: "Feedback", href: "/admin/feedbacks" },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string, title: string, message: string, href: string }[]>([]);
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
    <div className="flex min-h-screen bg-[#FCFBF9] font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col bg-zinc-950 text-zinc-400 md:flex z-20 shadow-2xl">
        <div className="p-6">
          <Link href="/" className="text-2xl font-serif italic text-white tracking-tight">
            Lucky Balls
          </Link>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Admin Workspace</p>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${isActive
                    ? "bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-zinc-700"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-900 p-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-2 rounded-xl font-medium text-zinc-400 hover:bg-zinc-900/80 hover:text-white"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-zinc-950 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-zinc-900">
              <div>
                <p className="text-2xl font-serif italic text-white tracking-tight">Lucky Balls</p>
                <p className="mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Admin Workspace</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                <X size={18} />
              </Button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${isActive
                        ? "bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800"
                        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                      }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-zinc-700"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-900 bg-zinc-950">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-center gap-2 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white bg-zinc-950 rounded-xl"
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
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-0 h-auto text-zinc-700 hover:bg-transparent" onClick={() => setIsMobileMenuOpen(true)}>
              <div className="space-y-1.5">
                <span className="block w-5 h-0.5 bg-current rounded-full"></span>
                <span className="block w-4 h-0.5 bg-current rounded-full"></span>
                <span className="block w-5 h-0.5 bg-current rounded-full"></span>
              </div>
            </Button>
            <p className="font-bold font-serif italic text-zinc-900 text-lg">Lucky Balls</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 w-8 p-0 rounded-full text-zinc-500 hover:text-rose-600 hover:bg-rose-50"><LogOut size={16} /></Button>
        </div>

        <div className="mx-auto w-full px-4 py-6 md:px-8 md:py-10 max-w-7xl">
          <div className="mb-6 rounded-2xl bg-white p-5 md:p-8 shadow-sm border border-zinc-200/60 md:mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Admin Workspace</p>
              <h1 className="mt-1 text-2xl font-serif italic text-zinc-900 md:text-3xl tracking-tight">{title}</h1>
            </div>
          </div>
          {children}
        </div>
      </main>

      {/* Notifications Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map(note => (
          <div key={note.id} className="pointer-events-auto flex w-72 gap-3 rounded-[1.2rem] border border-zinc-200/80 bg-white/95 p-4 shadow-lg backdrop-blur md:w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 flex-shrink-0">
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-zinc-900">{note.title}</h4>
              <p className="text-xs text-zinc-500 mt-1">{note.message}</p>
              <Link href={note.href} className="text-xs font-medium text-zinc-800 hover:text-zinc-600 mt-2 inline-block">
                View Details &rarr;
              </Link>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))} className="text-zinc-400 hover:text-zinc-600 self-start">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
