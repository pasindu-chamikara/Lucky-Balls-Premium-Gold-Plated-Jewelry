"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, User, LogOut, Package, Menu, X, Store, Info, Star, ChevronDown } from "lucide-react";
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
];

export function Navbar() {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  
  // Mega Menu State
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
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
    <header className="sticky top-0 z-50 border-b border-pink-500/20 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-zinc-700 p-0 h-auto hover:bg-transparent hover:text-pink-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </Button>

          <Link href="/" className="flex items-center gap-3 text-lg font-bold text-zinc-900 group z-50">
            <div className="relative h-10 w-10 overflow-hidden rounded-full shadow-[0_0_15px_rgba(219,39,119,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(219,39,119,0.6)]">
              <Image 
                src="/logo.jpeg" 
                alt="Lucky Balls Logo" 
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-pink-500 transition-colors hidden sm:inline-block tracking-tight">Lucky Balls</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-700 bg-zinc-50/50 p-1.5 rounded-full border border-zinc-200/80 shadow-sm backdrop-blur-sm relative">
          
          {/* Shop Mega Menu Trigger */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <Link 
              href="/shop" 
              className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                pathname.startsWith('/shop')
                  ? "bg-white text-pink-600 shadow-sm ring-1 ring-zinc-200/50" 
                  : "hover:bg-white hover:text-pink-600 text-zinc-700"
              }`}
            >
              <Store size={16} className={`${pathname.startsWith('/shop') ? "text-pink-600" : "text-zinc-500 group-hover:text-pink-600"} transition-colors`} />
              <span>Shop</span>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180 text-pink-500" : ""}`} />
            </Link>

            {/* Mega Dropdown */}
            <div 
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
                isMegaMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible 10"
              }`}
            >
              <div className="w-[600px] bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden p-6 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 px-2">Shop by Category</h3>
                  <div className="space-y-1">
                    <Link href="/shop" className="block px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium">
                      All Products
                    </Link>
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-zinc-400 italic">Loading categories...</div>
                    ) : (
                      categories.map(cat => (
                        <Link key={cat.id} href={`/shop?category=${cat.id}`} className="block px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-pink-50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group/promo">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover/promo:bg-pink-500/20 transition-colors"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-pink-950 mb-2">New Arrivals</h3>
                    <p className="text-sm text-pink-800/80 mb-6 leading-relaxed">Discover our latest 18K gold plated pieces, carefully curated for your everyday elegance.</p>
                  </div>
                  <Link href="/shop">
                    <Button size="sm" className="w-full bg-pink-600 text-white hover:bg-pink-500 shadow-md">
                      Shop Collection
                    </Button>
                  </Link>
                </div>
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
                className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 group/link ${
                  isActive 
                    ? "bg-white text-pink-600 shadow-sm ring-1 ring-zinc-200/50" 
                    : "hover:bg-white hover:text-pink-600 text-zinc-700"
                }`}
              >
                <Icon size={16} className={`${isActive ? "text-pink-600" : "text-zinc-500 group-hover/link:text-pink-600"} transition-colors`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart">
            <Button size="sm" className="gap-2 bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_10px_rgba(219,39,119,0.4)] transition-all duration-300 rounded-full relative px-4">
              <ShoppingBag size={16} />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-pink-600 shadow-sm animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          
          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200">
                  <User size={14} className="text-zinc-500" />
                  <span className="max-w-[100px] xl:max-w-[150px] truncate">{user.email}</span>
                </div>
                <Button onClick={handleSignOut} size="icon" variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full h-9 w-9 transition-colors">
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline" className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-full transition-all duration-300 font-medium px-5 shadow-sm">
                  Sign in
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/50 bg-white/95 backdrop-blur-2xl animate-in slide-in-from-top-2 absolute w-full shadow-2xl h-[calc(100vh-73px)] overflow-y-auto pb-20">
          <nav className="flex flex-col p-4 gap-2">
            
            {/* Mobile Shop Accordion */}
            <div className="rounded-2xl bg-zinc-50/80 border border-zinc-100 overflow-hidden">
              <button 
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className="w-full px-4 py-4 flex items-center justify-between text-zinc-900 font-medium text-base"
              >
                <div className="flex items-center gap-3">
                  <Store size={18} className={mobileShopOpen ? "text-pink-600" : "text-zinc-500"} />
                  <span className={mobileShopOpen ? "text-pink-600" : ""}>Shop</span>
                </div>
                <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${mobileShopOpen ? "rotate-180" : ""}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${mobileShopOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-4 pt-0 space-y-1 pl-11">
                  <Link 
                    href="/shop" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-pink-600 bg-pink-50"
                  >
                    View All Products
                  </Link>
                  {categories.map(cat => (
                    <Link 
                      key={cat.id} 
                      href={`/shop?category=${cat.id}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm text-zinc-600 hover:bg-white transition-colors"
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-4 rounded-2xl transition-all font-medium text-base flex items-center gap-3 group/mobile ${
                    isActive 
                      ? "bg-zinc-50 text-pink-600 border border-zinc-100" 
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <Icon size={18} className={`${isActive ? "text-pink-600" : "text-zinc-500 group-hover/mobile:text-pink-600"} transition-colors`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {user && (
              <div className="mt-4 pt-4 border-t border-zinc-200/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-zinc-500 bg-zinc-50 p-3 rounded-xl flex-1 mr-4 border border-zinc-100">
                  <User size={16} className="text-zinc-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <Button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} size="icon" variant="ghost" className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50 h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100">
                  <LogOut size={18} />
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
