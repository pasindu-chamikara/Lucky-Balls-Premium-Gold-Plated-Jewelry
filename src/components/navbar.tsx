"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { User, LogOut, Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

const standardLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/orders", label: "Orders" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  // Mega Menu State
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  useEffect(() => {
    // Fetch categories for Mega Menu
    async function fetchCategories() {
      try {
        const catSnap = await getDocs(query(collection(db, "categories"), orderBy("name")));
        setCategories(catSnap.docs.map(d => ({ id: d.id, name: d.data().name })));
      } catch (error) {
        console.error("Error fetching categories for navbar:", error);
      }
    }
    fetchCategories();

    // Hash tracking for active links
    setActiveHash(window.location.hash);
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const checkIsActive = (href: string) => {
    if (href.startsWith('/#')) {
      const hash = href.split('#')[1];
      return pathname === '/' && activeHash === `#${hash}`;
    }
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-2)]/90 backdrop-blur-md border-b border-[var(--border)] pointer-events-auto font-sans transition-all duration-300 shadow-[0_10px_30px_rgba(31,26,23,0.04)]">
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-4.5">

        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-zinc-800 p-0 h-auto hover:bg-transparent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </Button>

          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group z-50"
            onClick={() => {
              setActiveHash("");
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Lucky Balls Logo"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <span className="text-[var(--foreground)] font-serif italic text-xl sm:text-2xl font-normal">
              Lucky Balls
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-normal relative">

          {/* Shop Mega Menu Trigger */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <Link
              href="/shop"
              className={`relative flex items-center gap-1 transition-colors duration-300 group/link text-[13px] uppercase tracking-[0.2em] ${pathname.startsWith('/shop') ? "text-[var(--foreground)] font-medium" : "text-[var(--accent-deep)]/80 hover:text-[var(--foreground)] font-normal"}`}
            >
              <span>Shop</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180 text-zinc-900" : ""}`} />
            </Link>

            {/* Mega Dropdown */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-6 transition-all duration-300 ${isMegaMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
            >
              <div className="w-[600px] bg-white/95 border border-zinc-100 shadow-xl rounded-2xl overflow-hidden p-6 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4 px-2">Shop by Category</h3>
                  <div className="space-y-1">
                    <Link href="/shop" className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors font-medium rounded-md">
                      All Products
                    </Link>
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-zinc-400 italic">Loading categories...</div>
                    ) : (
                      categories.map(cat => (
                        <Link key={cat.id} href={`/shop?category=${cat.id}`} className="block px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors rounded-md">
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-zinc-50 p-6 flex flex-col justify-between rounded-xl relative overflow-hidden group/promo border border-zinc-100">
                  <div className="relative z-10">
                    <h3 className="text-xl font-serif italic text-zinc-900 mb-2">New Arrivals</h3>
                    <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Discover our latest pieces, carefully curated for your everyday elegance.</p>
                  </div>
                  <Link href="/shop" className="block w-full">
                    <Button size="sm" variant="outline" className="w-full border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-medium tracking-wide text-xs">
                      Shop Collection
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {standardLinks.map((link) => {
            const isActive = checkIsActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.href === '/' && pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                  if (link.href.includes('#')) {
                    setActiveHash(link.href.substring(link.href.indexOf('#')));
                  }
                }}
                className={`relative transition-colors duration-300 group/link py-2 text-[13px] uppercase tracking-[0.2em] ${isActive ? "text-[var(--foreground)] font-medium" : "text-[var(--accent-deep)]/80 hover:text-[var(--foreground)] font-normal"}`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-6">
          {!loading && (
            user ? (
              <div className="relative group/profile py-2 hidden md:block">
                <button className="flex items-center text-zinc-600 hover:text-zinc-900 transition-colors" aria-label="Account">
                  <User size={20} />
                </button>

                {/* Profile Dropdown */}
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300">
                  <div className="w-48 bg-white border border-zinc-100 shadow-xl rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="text-xs font-medium text-zinc-900 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors font-medium rounded-md"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <span className="flex items-center text-zinc-600 hover:text-zinc-900 transition-colors" aria-label="Log in">
                  <User size={20} />
                </span>
              </Link>
            )
          )}

          <Link href="/cart" className="flex items-center gap-1 text-zinc-900 hover:text-zinc-600 transition-colors font-medium" aria-label="Cart">
            <ShoppingCart size={20} />
            <span className="text-xs">({totalItems})</span>
          </Link>
        </div>
      </header>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[69px] left-0 right-0 bottom-0 bg-white/95 backdrop-blur-2xl animate-in slide-in-from-top-2 shadow-2xl overflow-y-auto pb-24 pt-4 pointer-events-auto z-40 border-t border-zinc-100">
          <nav className="flex flex-col px-6 sm:px-8 gap-3">

            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all font-semibold text-lg flex items-center justify-center group/mobile ${pathname.startsWith('/shop')
                ? "bg-rose-50 text-rose-600 border border-zinc-100"
                : "text-zinc-700 hover:bg-zinc-50"
                }`}
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              <span>Shop</span>
            </Link>

            {standardLinks.map((link) => {
              const isActive = checkIsActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (link.href === '/' && pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    if (link.href.includes('#')) {
                      setActiveHash(link.href.substring(link.href.indexOf('#')));
                    }
                  }}
                  className={`px-4 py-3 rounded-xl transition-all font-semibold text-lg flex items-center justify-center group/mobile ${isActive
                    ? "bg-zinc-50 text-rose-600 border border-zinc-100"
                    : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="mt-6 pt-6 border-t border-zinc-200/80 px-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-zinc-500 bg-zinc-50 p-3 rounded-xl flex-1 mr-4 border border-zinc-100">
                  <User size={16} className="text-zinc-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <Button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} size="icon" variant="ghost" className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50 h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-zinc-200/80 px-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-800 py-3.5 rounded-xl font-medium text-center flex items-center justify-center transition-colors"
                >
                  Log in to your account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
