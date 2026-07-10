"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, Coins, Headset, ShieldCheck, RefreshCcw, ArrowUp } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

export function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    
    // Fetch categories
    const fetchCats = async () => {
      try {
        const catSnap = await getDocs(query(collection(db, "categories"), orderBy("name")));
        const allCats = catSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setCategories(allCats.slice(0, 5));
      } catch (error) {
        console.error("Error fetching categories for footer:", error);
      }
    };
    fetchCats();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section className="bg-black border-t border-zinc-800 py-6 relative overflow-hidden">
        {/* Subtle gold glow behind features */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-pink-400/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 items-start px-6 lg:px-8 pb-4 md:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { icon: Truck, title: "Islandwide Delivery", desc: "Fast & reliable" },
              { icon: Coins, title: "Cash On Delivery", desc: "Pay at your door" },
              { icon: Headset, title: "24/7 SUPPORT", desc: "Always here for you" },
              { icon: ShieldCheck, title: "100% SAFE", desc: "Secure shopping" },
              { icon: RefreshCcw, title: "No Exchange", desc: "Quality guaranteed" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex-shrink-0 w-[140px] md:w-auto flex flex-col items-center text-center group snap-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 bg-pink-400/10 text-pink-400 rounded-full flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:-translate-y-1 group-hover:scale-110 duration-300 shadow-[0_0_15px_rgba(244,114,182,0.1)] group-hover:shadow-[0_0_20px_rgba(244,114,182,0.3)]">
                    <Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white font-semibold text-[13px] uppercase tracking-wider mb-2">{feature.title}</h4>
                  <p className="text-zinc-400 text-xs">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50"></div>

      <footer className="bg-black text-white relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 md:gap-12 lg:gap-8 text-center md:text-left">
            {/* Column 1: Brand */}
            <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start">
              <div className="relative inline-flex flex-col items-center md:items-start gap-3 overflow-hidden group cursor-pointer">
                <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-full border border-pink-400/50 shadow-[0_0_10px_rgba(244,114,182,0.3)]">
                  <Image src="/logo.jpeg" alt="Lucky Balls Logo" fill sizes="(max-width: 768px) 64px, 80px" className="object-cover" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-pink-400 tracking-tight relative z-10">
                  Lucky Balls
                </h2>
                {/* Animated shimmer on logo */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-[shimmer_2s_infinite]"></div>
              </div>
              <p className="text-sm leading-relaxed font-sans text-zinc-400 max-w-xs">
                Premium Jewellery Crafted With Elegance. Discover stylish pieces designed to make every moment extraordinary.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm font-medium text-zinc-400 font-sans flex flex-col items-center md:items-start">
                {[
                  { label: "Home", href: "/" },
                  { label: "About Us", href: "/about" },
                  { label: "Products", href: "/shop" },
                  { label: "Contact", href: "/contact" },
                  { label: "FAQs", href: "/faq" },
                  { label: "Shipping Policy", href: "/shipping-policy" }
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="relative inline-block group hover:text-pink-400 transition-colors duration-300">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider mb-4">
                Categories
              </h3>
              <ul className="space-y-2 text-sm font-medium text-zinc-400 font-sans flex flex-col items-center md:items-start">
                {categories.length > 0 ? categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.id}`} className="relative inline-block group hover:text-pink-400 transition-colors duration-300">
                      {cat.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                )) : (
                  <li className="opacity-50">Loading categories...</li>
                )}
              </ul>
            </div>

            {/* Column 4: Contact Details */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-sm font-medium text-zinc-400 font-sans flex flex-col items-center md:items-start">
                <li className="flex items-center md:items-start gap-3 text-left">
                  <span className="text-pink-400 mt-0.5">📞</span>
                  <a href="tel:0722801414" className="hover:text-pink-400 transition-colors duration-300">072 280 1414</a>
                </li>
                <li className="flex items-center md:items-start gap-3 text-left">
                  <span className="text-pink-400 mt-0.5">✉️</span>
                  <span>info@luckyballs.lk</span>
                </li>
                <li className="flex items-center md:items-start gap-3 text-left">
                  <span className="text-pink-400 mt-0.5">📍</span>
                  <span>Colombo, Sri Lanka</span>
                </li>
                <li className="flex items-center md:items-start gap-3 text-left">
                  <span className="text-pink-400 mt-0.5">🕘</span>
                  <span>Mon - Sat | 9AM - 6PM</span>
                </li>
              </ul>
            </div>

            {/* Column 5: Social Media */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider mb-4">
                We're Social
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {[
                  {
                    label: "Facebook",
                    href: "https://www.facebook.com/share/1DDmyjedcE/",
                    icon: <svg viewBox="0 0 320 512" width="18" height="18" fill="currentColor"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
                  },
                  {
                    label: "TikTok",
                    href: "https://www.tiktok.com/@lucky.balls?_r=1&_t=ZS-97fRtHuHIiD",
                    icon: <svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" /></svg>
                  },
                  {
                    label: "WhatsApp",
                    href: "https://wa.me/luckyballs",
                    icon: <svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>
                  }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="h-10 w-10 rounded-full border border-zinc-800 bg-white/5 flex items-center justify-center text-zinc-400 transition-all duration-300 hover:border-pink-400 hover:text-pink-400 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(244,114,182,0.3)]"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

        {/* Bottom Footer */}
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">



            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <Link href="/privacy" className="hover:text-pink-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-pink-400 transition-colors">Terms & Conditions</Link>
            </div>

            <p className="text-sm text-zinc-500 text-center md:text-right">
              © {new Date().getFullYear()} Lucky Balls.<br className="md:hidden" /> All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-2.5 md:p-3 rounded-full bg-pink-400 text-black shadow-[0_0_20px_rgba(244,114,182,0.4)] hover:bg-pink-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(244,114,182,0.6)] transition-all duration-300 ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
        aria-label="Back to top"
      >
        <ArrowUp size={24} />
      </button>
    </>
  );
}