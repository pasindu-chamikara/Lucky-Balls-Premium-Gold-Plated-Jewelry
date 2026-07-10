"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, User, LogOut, Package, Menu, X, Store, Info, Star, ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

const standardLinks = [
  { href: "/about", label: "About", icon: Info },
  { href: "/#reviews", label: "Reviews", icon: Star },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
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
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="fixed top-2 left-0 right-0 z-50 px-2 sm:px-4 flex justify-center pointer-events-none font-sans">
      <header className="pointer-events-auto w-full max-w-5xl rounded-full border border-zinc-200/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-zinc-900/5 flex items-center justify-between px-4 py-2 transition-all duration-300">

        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-zinc-700 p-0 h-auto hover:bg-transparent hover:text-rose-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </Button>

          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold text-zinc-900 group z-50"
            onClick={() => setActiveHash("")}
          >
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border border-zinc-100 transition-transform duration-300 group-hover:scale-105 shadow-sm shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Lucky Balls Logo"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <span className="text-zinc-900 font-extrabold tracking-tight">
              LUCKY BALLS
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-700 relative">

          {/* Shop Mega Menu Trigger */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <Link
              href="/shop"
              className={`relative flex items-center gap-1.5 transition-colors duration-300 group/link ${pathname.startsWith('/shop') ? "text-rose-600" : "hover:text-rose-600 text-zinc-700"
                }`}
            >
              <span>Shop</span>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180 text-rose-600" : ""}`} />
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-rose-500 transition-all duration-300 ${pathname.startsWith('/shop') ? "w-full" : "w-0 group-hover/link:w-full"}`}></span>
            </Link>

            {/* Mega Dropdown */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${isMegaMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                }`}
            >
              <div className="w-[600px] bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden p-6 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4 px-2">Shop by Category</h3>
                  <div className="space-y-1">
                    <Link href="/shop" className="block px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-pink-50 hover:text-rose-600 transition-colors font-medium">
                      All Products
                    </Link>
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-zinc-400 italic">Loading categories...</div>
                    ) : (
                      categories.map(cat => (
                        <Link key={cat.id} href={`/shop?category=${cat.id}`} className="block px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-pink-50 hover:text-rose-600 transition-colors">
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-pink-50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group/promo">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover/promo:bg-pink-500/20 transition-colors"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-rose-600 mb-2">New Arrivals</h3>
                    <p className="text-sm text-rose-600/80 mb-6 leading-relaxed">Discover our latest 18K gold plated pieces, carefully curated for your everyday elegance.</p>
                  </div>
                  <Link href="/shop">
                    <Button size="sm" className="w-full bg-rose-500 text-zinc-900 hover:bg-pink-500 shadow-md">
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
                  if (link.href.includes('#')) {
                    setActiveHash(link.href.substring(link.href.indexOf('#')));
                  }
                }}
                className={`relative transition-colors duration-300 group/link py-2 ${isActive ? "text-rose-600" : "hover:text-rose-600 text-zinc-700"
                  }`}
              >
                <span>{link.label}</span>
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-rose-500 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover/link:w-full"}`}></span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart">
            <Button size="icon" variant="ghost" className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-full relative h-9 w-9 transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {!loading && (
            user ? (
              <div className="relative group/profile py-2 hidden md:block">
                <Button size="icon" variant="ghost" className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-full h-9 w-9 transition-colors">
                  <User size={20} />
                </Button>

                {/* Profile Dropdown */}
                <div className="absolute right-0 top-[100%] opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300">
                  <div className="w-48 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                      <p className="text-xs text-zinc-500 mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold text-zinc-900 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button size="sm" variant="ghost" className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all duration-300 font-medium px-4 h-9">
                  Log in
                </Button>
              </Link>
            )
          )}
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 right-0 bottom-0 bg-white/95 backdrop-blur-2xl animate-in slide-in-from-top-2 shadow-2xl overflow-y-auto pb-20 pointer-events-auto z-40 border-t border-zinc-100">
          <nav className="flex flex-col p-4 gap-2">

            {/* Mobile Shop Accordion */}
            <div className="rounded-2xl bg-zinc-50/80 border border-zinc-100 overflow-hidden">
              <button
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className="w-full px-4 py-4 flex items-center justify-between text-zinc-900 font-medium text-base"
              >
                <div className="flex items-center">
                  <span className={mobileShopOpen ? "text-rose-600" : ""}>Shop</span>
                </div>
                <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${mobileShopOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${mobileShopOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-4 pt-0 space-y-1 pl-11">
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-pink-50"
                  >
                    View All Products
                  </Link>
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm text-zinc-700 hover:bg-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {standardLinks.map((link) => {
              const Icon = link.icon;
              const isActive = checkIsActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (link.href.includes('#')) {
                      setActiveHash(link.href.substring(link.href.indexOf('#')));
                    }
                  }}
                  className={`px-4 py-4 rounded-2xl transition-all font-medium text-base flex items-center group/mobile ${isActive
                    ? "bg-zinc-50 text-rose-600 border border-zinc-100"
                    : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="mt-4 pt-4 border-t border-zinc-200/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-zinc-500 bg-zinc-50 p-3 rounded-xl flex-1 mr-4 border border-zinc-100">
                  <User size={16} className="text-zinc-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <Button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} size="icon" variant="ghost" className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50 h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-zinc-200/80 px-4">
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
    </div>
  );
}
