"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { Footer } from "@/components/footer";
import { CustomizeModal } from "@/components/customize-modal";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Star, ShieldCheck, Gem, Gift, Heart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  isPinnedForHome: boolean;
  isFeaturedThisWeek?: boolean;
};

type Category = {
  id: string;
  name: string;
  image?: string;
};

const reviewsList = [
  { name: "Sarah L.", text: "Absolutely stunning pieces. The packaging itself felt so premium. Will definitely buy again!" },
  { name: "Nethmi D.", text: "I wear my necklace every day and it still hasn't lost its shine. Truly high-quality." },
  { name: "Amaya P.", text: "The perfect gift. The customer service was exceptionally helpful and polite." },
  { name: "Jessica M.", text: "I'm in love with the modern designs. I always get compliments when I wear my new bracelet." },
  { name: "Dilrukshi K.", text: "Fast shipping and the quality is outstanding. Highly recommend to anyone looking for elegant jewelry." }
];

export default function Home() {
  const [currentReview, setCurrentReview] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = categoriesRef.current.offsetWidth / 2;
      categoriesRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviewsList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchStoreData() {
      try {
        const [prodSnap, catSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(query(collection(db, "categories"), orderBy("name")))
        ]);

        const allProducts = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(allProducts.filter(p => p.isPinnedForHome).slice(0, 4));
        setFeaturedProduct(allProducts.find(p => p.isFeaturedThisWeek) || null);

        const allCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(allCats);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreData();
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#FAF8F5] text-[#1F1F1F]">
      <Navbar />

      <main className="flex-1 overflow-hidden">

        {/* 1. Hero Section */}
        <section className="relative w-full min-h-[95vh] md:min-h-[85vh] flex items-center bg-gradient-to-r from-[#EDE5DF] to-[#FAF8F5] overflow-hidden pt-32 pb-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-2 gap-8 md:gap-12 items-center z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="bg-white/30 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none p-6 rounded-2xl lg:p-0"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-[#1F1F1F] leading-[1.1] mb-4 md:mb-6">
                Jewelry That <br />Speaks <span className="italic text-[#D6A77A]">Elegance</span>
              </h1>
              <p className="text-base md:text-lg text-[#1F1F1F]/80 md:text-[#1F1F1F]/70 font-light mb-8 md:mb-10 max-w-md">
                Premium gold-plated pieces designed to celebrate your everyday moments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop" className="bg-[#1F1F1F] text-[#FAF8F5] px-6 py-4 md:px-8 text-center uppercase tracking-widest text-xs font-medium hover:bg-[#D6A77A] transition-colors duration-500">
                  Shop Collection
                </Link>
                <Link href="/about" className="bg-transparent border border-[#1F1F1F] text-[#1F1F1F] px-6 py-4 md:px-8 text-center uppercase tracking-widest text-xs font-medium hover:bg-[#1F1F1F] hover:text-[#FAF8F5] transition-colors duration-500">
                  Our Story
                </Link>
              </div>

              <div className="mt-8 md:mt-10 flex flex-row items-center justify-between lg:justify-start gap-2 sm:gap-6 lg:gap-12 pt-6 border-t border-[#1F1F1F]/10">
                <div className="flex flex-col">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1F1F1F]">500+</p>
                  <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.15em] sm:tracking-widest text-[#1F1F1F]/60 mt-1">Customers</p>
                </div>
                <div className="w-[1px] h-8 bg-[#1F1F1F]/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1F1F1F]">250+</p>
                  <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.15em] sm:tracking-widest text-[#1F1F1F]/60 mt-1">Products</p>
                </div>
                <div className="w-[1px] h-8 bg-[#1F1F1F]/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1F1F1F]">4.9</p>
                  <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.15em] sm:tracking-widest text-[#1F1F1F]/60 mt-1">Rating</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute right-0 top-0 w-full lg:w-[55%] h-full z-0 overflow-hidden"
          >
            <Image src="/images/home main.jpg" alt="Lucky Balls Premium Jewelry" fill className="object-cover object-[center_right] md:object-center" priority />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-[#EDE5DF]/40 to-[#EDE5DF]/90 md:to-[#EDE5DF] block"></div>
          </motion.div>
        </section>

        {/* 2. Featured Collections */}
        <section className="py-20 bg-[#F8F4F1]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-[2.75rem] font-serif text-[#1F1F1F] italic mb-4">Shop by Category</h2>
            <p className="uppercase tracking-[0.25em] text-[10px] md:text-[11px] text-[#B8865C] font-bold">FIND EXACTLY WHAT YOU'RE LOOKING FOR.</p>
          </motion.div>

          <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative group">
            <button onClick={() => scrollCategories('left')} className="absolute left-4 md:left-8 top-[35%] -translate-y-1/2 z-10 w-10 h-10 bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[#1F1F1F] hidden md:flex hover:bg-[#FAF8F5] transition-colors">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button onClick={() => scrollCategories('right')} className="absolute right-4 md:right-8 top-[35%] -translate-y-1/2 z-10 w-10 h-10 bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[#1F1F1F] hidden md:flex hover:bg-[#FAF8F5] transition-colors">
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>

            <div ref={categoriesRef} className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[calc(50%-1rem)] md:min-w-[calc(25%-1.5rem)] flex flex-col items-center shrink-0 snap-start">
                    <div className="w-[80%] aspect-square bg-[#EDE5DF] animate-pulse mb-6 shadow-sm mx-auto"></div>
                  </div>
                ))
              ) : (
                categories.map((cat, i) => {
                  const imageSrc = cat.image || `/images/cat-${cat.name.toLowerCase()}.jpg`;

                  return (
                    <div key={cat.id} className="min-w-[calc(50%-1rem)] md:min-w-[calc(25%-1.5rem)] shrink-0 snap-start flex flex-col items-center">
                      <Link href={`/shop?category=${cat.id}`} className="w-[80%] mx-auto aspect-square relative mb-6 overflow-hidden bg-[#EDE5DF] group/img block shadow-sm">
                        <Image src={imageSrc} alt={cat.name} fill sizes="(max-width: 768px) 33vw, 33vw" className="object-cover transition-transform duration-[1.5s] ease-in-out group-hover/img:scale-105" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
                      </Link>
                      <h3 className="font-serif text-[1.35rem] text-[#1F1F1F] mb-3 italic">{cat.name}</h3>
                      <Link href={`/shop?category=${cat.id}`} className="uppercase tracking-[0.2em] text-[9px] text-[#1F1F1F] font-bold hover:text-[#B8865C] transition-colors flex items-center gap-1.5">
                        EXPLORE <span className="text-[12px] leading-none mb-[2px]">&rarr;</span>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </section>

        {/* 3. Luxury Campaign Section */}
        <section className="py-8 md:py-16 bg-[#1F1F1F] text-[#FAF8F5] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-6 md:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="order-2 md:order-1 text-center md:text-left">
              <h2 className="text-3xl md:text-6xl font-serif leading-tight mb-4 md:mb-8">Crafted For <br className="hidden md:block" /><span className="italic text-[#D6A77A]">Modern Women</span></h2>
              <p className="text-xs md:text-base font-light text-[#FAF8F5]/70 leading-relaxed mb-6 md:mb-10 max-w-md mx-auto md:mx-0">
                Every piece is meticulously designed to empower, inspire, and elevate your personal style. Embrace the luxury you deserve.
              </p>
              <div>
                <Link href={featuredProduct ? `/product/${featuredProduct.id}` : "/shop"} className="group block w-full max-w-sm mx-auto md:mx-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-[#2A2A2A] relative overflow-hidden shrink-0 flex items-center justify-center border border-white/5 group-hover:border-[#D6A77A]/30 transition-colors">
                      <Image src={featuredProduct?.image || "/images/cat-necklaces.jpg"} alt={featuredProduct?.name || "Signature Gold Collection"} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-500 z-0" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#D6A77A]/40 to-black/20 mix-blend-overlay z-10 pointer-events-none"></div>
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#D6A77A] mb-1 font-semibold">Featured Item</div>
                      <div className="font-serif text-lg text-[#FAF8F5] mb-0.5 line-clamp-1">{featuredProduct?.name || "Signature Gold Collection"}</div>
                      <div className="text-xs text-[#FAF8F5]/50 flex items-center gap-2">
                        <span>Explore now</span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="order-1 md:order-2 relative aspect-[4/3] md:aspect-video lg:aspect-square bg-[#333] overflow-hidden">
              <video src="/videos/crafted.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            </motion.div>
          </div>
        </section>

        {/* 4. Best Sellers Section */}
        <section className="py-16 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-between items-end mb-8 md:mb-10">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1F]">Best Selling</h2>
              <Link href="/shop" className="uppercase tracking-widest text-xs font-medium border-b border-[#1F1F1F] pb-1 hover:text-[#D6A77A] hover:border-[#D6A77A] transition-colors hidden md:block">
                View All
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {loading ? (
                Array(4).fill(0).map((_, i) => <div key={i} className="aspect-square bg-[#EDE5DF] animate-pulse"></div>)
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image || "/images/gift-basket.svg"}
                    onShopClick={(quantity) => {
                      setSelectedProduct(product);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-[#1F1F1F]/50">No products found.</div>
              )}
            </motion.div>
          </div>
        </section>



        {/* 6. Customer Reviews (Glassmorphism Slider) */}
        <section id="reviews" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
          <div className="absolute top-0 right-[-10%] w-[40vw] h-[40vw] bg-[#F3E8E6] rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-[-10%] w-[30vw] h-[30vw] bg-[#EDE5DF] rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl font-serif mb-12">Words Of Elegance</h2>

            <div className="relative min-h-[300px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-full grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {[0, 1, 2].map((offset) => {
                    const reviewIndex = (currentReview + offset) % reviewsList.length;
                    const review = reviewsList[reviewIndex];
                    return (
                      <div key={offset} className={`bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex-col justify-between h-full min-h-[250px] ${offset > 0 ? 'hidden md:flex' : 'flex'}`}>
                        <div>
                          <div className="flex justify-center md:justify-start mb-6">
                            {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className="text-[#D6A77A] fill-[#D6A77A] mx-[1px]" />)}
                          </div>
                          <p className="font-serif italic text-lg text-[#1F1F1F]/80 mb-6 leading-relaxed md:text-left">"{review.text}"</p>
                        </div>
                        <p className="uppercase tracking-widest text-xs font-bold text-[#1F1F1F] md:text-left">{review.name}</p>
                      </div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              {reviewsList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentReview(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentReview ? 'bg-[#1F1F1F] w-8' : 'bg-[#1F1F1F]/20'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 7. Brand Story Timeline */}
        <section className="py-16 bg-[#1F1F1F] text-[#FAF8F5]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Journey</h2>
            <p className="font-serif text-xl md:text-2xl italic text-[#FAF8F5]/90 leading-relaxed mb-16">
              Started in 2024, Lucky Balls has grown through social media into a trusted Sri Lankan jewelry brand, bringing affordable luxury to over <span className="text-[#D6A77A] font-semibold not-italic">5,000</span> happy customers.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-16">
              {[
                { stat: "2024", label: "Founded" },
                { stat: "5000+", label: "Happy Customers" },
                { stat: "300+", label: "Unique Designs" },
                { stat: "100%", label: "Satisfaction" }
              ].map((s, i) => (
                <div key={i}>
                  <h3 className="text-3xl font-serif text-[#D6A77A] mb-2">{s.stat}</h3>
                  <p className="uppercase tracking-widest text-[10px] text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Instagram Editorial Gallery (Masonry) */}
        <section className="py-16 bg-[#FAF8F5]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <p className="uppercase tracking-[0.2em] text-xs text-[#1F1F1F]/50 font-medium mb-4">The Style Journal</p>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1F1F1F]">Curated <span className="italic text-[#D6A77A]">Elegance</span></h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 lg:gap-8 md:auto-rows-[300px]">
              {[
                { src: "/images/1.jpg", span: "col-span-2 aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto", subtitle: "Timeless Elegance", title: "The Gold Standard" },
                { src: "/images/2.jpg", span: "col-span-1 aspect-[4/5] md:col-span-1 md:row-span-2 md:aspect-auto", subtitle: "Everyday Luxury", title: "Subtle Statements" },
                { src: "/images/3.jpg", span: "col-span-1 aspect-[4/5] md:col-span-1 md:row-span-1 md:aspect-auto", subtitle: "Handcrafted", title: "Artisan Details" },
                { src: "/images/4.jpg", span: "col-span-2 aspect-[21/9] md:col-span-1 md:row-span-1 md:aspect-auto", subtitle: "New Arrivals", title: "Modern Classics" }
              ].map((img, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
                  className={`relative w-full h-full bg-[#EDE5DF] overflow-hidden group ${img.span} shadow-sm border border-black/5`}
                >
                  <Image src={img.src} alt="Facebook" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
                  {/* Premium overlay with subtle gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-4 md:p-8">
                    <p className="text-white/80 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium mb-1 md:mb-2 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-700 delay-100">{img.subtitle}</p>
                    <p className="text-white font-serif italic text-lg md:text-2xl md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-700 delay-150">{img.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Join The Club Section */}
        <section className="py-20 bg-[#EDE5DF] relative overflow-hidden">
          <Image src="/images/become.gif" alt="Background" fill sizes="100vw" className="object-cover opacity-20 mix-blend-multiply" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-[2.75rem] md:text-6xl font-serif text-[#1F1F1F] mb-6 tracking-wide italic uppercase">Join The Club</h2>
            <p className="uppercase tracking-[0.2em] text-[10px] md:text-[11px] text-[#1F1F1F]/80 font-bold leading-[2] max-w-[600px] mx-auto mb-10">
              Be the first to know about exclusive drops, behind-the-scenes content, and styling tips. Follow us on Facebook and TikTok.
            </p>
            <div className="flex justify-center items-center gap-4">
              <a href="https://facebook.com/luckyballs.jewelry" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#9C7F4B] flex items-center justify-center hover:bg-[#856B3D] transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://tiktok.com/@luckyballs.jewelry" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#9C7F4B] flex items-center justify-center hover:bg-[#856B3D] transition-colors shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.22-2.31.81-4.72 2.66-6.15 1.53-1.18 3.51-1.64 5.43-1.32v4.06c-1.31-.22-2.73.08-3.7 1.01-.98.92-1.28 2.45-.73 3.69.58 1.34 2.22 2.06 3.65 1.63 1.51-.44 2.43-2 2.4-3.59.04-5.4.02-10.8.03-16.2z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

      </main>

      {selectedProduct && (
        <CustomizeModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <Footer />
    </div>
  );
}
