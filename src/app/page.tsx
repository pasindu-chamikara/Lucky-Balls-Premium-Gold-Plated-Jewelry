"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionTitle } from "@/components/section-title";
import { CustomizeModal } from "@/components/customize-modal";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useCart } from "@/context/cart-context";

type Product = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  price: number;
  description: string;
  isFeaturedThisWeek: boolean;
  isPinnedForHome: boolean;
  isCustomizable: boolean;
  customizationOptions?: any[];
  image?: string;
  images?: string[];
  isOutOfStock?: boolean;
  stockQuantity?: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

const highlights = [
  {
    title: "Fast local delivery",
    description: "Reliable dispatch and same-day processing for most orders.",
  },
  {
    title: "Secure checkout",
    description: "Flexible cash-on-delivery with a smooth, modern order flow.",
  },
  {
    title: "Carefully curated",
    description: "Every piece is crafted for a memorable and elegant experience.",
  },
];

const REVIEW_COL_1 = [
  ["“Every piece I ordered looked even more beautiful in person. The quality exceeded my expectations.”", "— Chathu"],
  ["“The packaging was absolutely gorgeous. Opening my order felt like receiving a luxury gift.”", "— Sandu"],
  ["“I've worn my bracelet almost every day and it still looks brand new. I'm so happy with my purchase.”", "— Tharu"],
  ["“The ordering process was smooth and the customer service was incredibly friendly.”", "— Nimasha"],
  ["“I received so many compliments the very first time I wore it. Definitely coming back for more!”", "— Nethu"]
];

const REVIEW_COL_2 = [
  ["“Beautiful designs, amazing quality, and such elegant packaging. Everything felt premium.”", "— Kavindi"],
  ["“I bought this as a birthday gift and my sister absolutely loved it. Highly recommend!”", "— Dinushi"],
  ["“The jewelry shines beautifully and feels much more expensive than its price.”", "— Hashini"],
  ["“Lucky Balls has become my favorite place to shop for accessories. Every collection is stunning.”", "— Ishara"],
  ["“Fast delivery, secure packaging, and the product was exactly as shown. I'm impressed!”", "— Sachini"]
];

const REVIEW_COL_3 = [
  ["“The attention to detail is incredible. You can truly see the care put into every order.”", "— Upeksha"],
  ["“Simple, elegant, and timeless. These pieces match every outfit I wear.”", "— Ama"],
  ["“Shopping with Lucky Balls was such a lovely experience from start to finish.”", "— Dilki"],
  ["“The quality is outstanding and the pink-themed packaging is absolutely adorable.”", "— Shenali"],
  ["“I've already recommended Lucky Balls to all my friends. They loved my jewelry too!”", "— Piumi"]
];

function ReviewBox({ messages, delay }: { messages: string[][], delay: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [messages.length, delay]);

  return (
    <div className="bg-white p-6 md:p-8 h-[240px] md:h-[320px] flex flex-col relative overflow-hidden group border border-zinc-200 transition-all duration-300 hover:border-zinc-900">
      <div className="relative flex-1">
        {messages.map(([quote, name], idx) => {
          let transformClass = "opacity-0 translate-y-4";
          if (idx === currentIndex) {
            transformClass = "opacity-100 translate-y-0";
          } else if (idx === (currentIndex - 1 + messages.length) % messages.length) {
            transformClass = "opacity-0 -translate-y-4";
          }

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col justify-center ${transformClass}`}
            >
              <span className="text-6xl font-serif text-zinc-900/10 absolute top-4 left-4">"</span>
              <p className="text-lg md:text-xl leading-relaxed text-zinc-900 font-serif italic tracking-wide relative z-10 px-4 mt-6">{quote}</p>
              <p className="mt-6 md:mt-8 font-bold text-zinc-500 text-[10px] tracking-widest uppercase px-4">{name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItem, setFeaturedItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 200;
      const gap = window.innerWidth >= 1024 ? 32 : window.innerWidth >= 640 ? 16 : 12;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -(itemWidth + gap) : (itemWidth + gap),
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    async function fetchStoreData() {
      try {
        const [prodSnap, catSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(query(collection(db, "categories"), orderBy("name")))
        ]);

        const allProducts = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const allCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

        // Filter to only show pinned products, up to 4
        const pinnedProducts = allProducts.filter(p => p.isPinnedForHome).slice(0, 4);
        setProducts(pinnedProducts);
        setCategories(allCats);

        const featured = allProducts.find(p => p.isFeaturedThisWeek);
        if (featured) {
          setFeaturedItem(featured);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreData();
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-zinc-900/30 text-zinc-900 bg-[#FCFBF9]">
      <Navbar />
      <main className="flex-1">
        {/* Section 1: Hero */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto grid max-w-7xl px-4 sm:px-6 pt-24 sm:pt-32 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 border-b border-zinc-200 gap-0"
        >
          <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left lg:border-r lg:border-zinc-200 lg:pr-12 w-full">
            <h1 className="max-w-4xl text-4xl sm:text-6xl font-serif italic tracking-tighter lg:text-[5rem] leading-[1]">
              <span className="text-black">Beautiful jewellery <br /> delivered with </span>
              <span className="text-[var(--accent)]">elegance.</span>
            </h1>
            <p className="mt-8 sm:mt-12 max-w-xl text-xs sm:text-base leading-relaxed text-[var(--foreground)]/70 uppercase tracking-widest font-bold">
              Lucky Balls brings together curated 18K gold plated pieces, premium pink packaging, and a seamless shopping experience for everyday luxury.
            </p>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 w-full">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)] px-10 h-14 text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-none">
                  Shop Now <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border border-[var(--accent)] text-[var(--accent-deep)] bg-transparent hover:bg-[var(--surface-2)] px-10 h-14 text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center">
                  Our Story
                </Button>
              </Link>
            </div>
            <div className="mt-12 sm:mt-16 grid grid-cols-3 sm:flex sm:flex-row items-start sm:items-center justify-center sm:justify-start gap-2 sm:gap-12 w-full pt-8 border-t border-zinc-200">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-xl sm:text-3xl font-serif text-zinc-900">500+</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-900 uppercase tracking-widest mt-1">Happy Customers</span>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-xl sm:text-3xl font-serif text-zinc-900">250+</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-900 uppercase tracking-widest mt-1">Products</span>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-xl sm:text-3xl font-serif text-zinc-900">4.9</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-900 uppercase tracking-widest mt-1">Avg. Rating</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end mt-12 lg:mt-0 lg:pl-12">
            <div className="relative w-full max-w-[320px] sm:max-w-md md:max-w-lg aspect-[3/4] overflow-hidden group border border-zinc-200 bg-white">
              <div className="h-full w-full bg-[#FCFBF9] flex items-center justify-center">
                {featuredItem ? (
                  <Image
                    src={featuredItem.image || "/images/gift-basket.svg"}
                    alt={featuredItem.name}
                    width={600}
                    height={800}
                    priority
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full text-zinc-300">
                    <span className="mb-2 opacity-30 text-xs font-bold uppercase tracking-widest">Image Unavailable</span>
                  </div>
                )}
              </div>

              {/* Always visible minimalist overlay */}
              <div className="absolute inset-0 flex flex-col justify-end items-center p-8 pb-10 text-center bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-3">This week&apos;s feature</p>
                  <p className="text-2xl sm:text-3xl font-serif italic text-white mb-6">
                    {featuredItem ? featuredItem.name : "Select a featured item"}
                  </p>
                  {featuredItem && (
                    <Link href={`/product/${featuredItem.id}`}>
                      <span className="inline-flex items-center gap-2 text-zinc-900 bg-white px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
                        View Product
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 2: Browse By Category */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="py-6 sm:py-10 border-t border-zinc-200 bg-zinc-50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl font-serif italic text-zinc-900 md:text-5xl">Shop by Category</h2>
              <p className="mt-4 text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-widest">Find exactly what you're looking for.</p>
            </div>

            <div className="relative group">
              <div
                ref={scrollContainerRef}
                className="grid grid-flow-col auto-cols-[140px] sm:auto-cols-[180px] md:auto-cols-[calc(25%-12px)] lg:auto-cols-[calc(25%-24px)] gap-3 sm:gap-4 lg:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {loading ? (
                  <div className="col-span-full flex justify-center py-10 w-[90vw]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-zinc-9000 w-[90vw]">Categories will appear here.</div>
                ) : (
                  categories.map((cat, index) => (
                    <Link href={`/shop?category=${cat.id}`} key={cat.id} className="group block relative snap-start w-full">
                      <div className="relative aspect-square overflow-hidden bg-[#FCFBF9] w-full border border-zinc-200 group-hover:border-zinc-900 group-hover:border-2 transition-all">
                        <Image
                          src={cat.image || `/images/gift-basket.svg`}
                          alt={cat.name}
                          width={400}
                          height={400}
                          className={`object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105 ${cat.image ? '' : 'opacity-10'}`}
                        />
                      </div>

                      <div className="pt-4 pb-2 text-center border-t border-zinc-200 mt-4">
                        <h3 className="text-zinc-900 font-serif italic text-xl group-hover:text-zinc-500 transition-colors">{cat.name}</h3>
                        <p className="text-zinc-9000 text-[10px] mt-2 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest font-bold group-hover:text-zinc-500">
                          Explore <ArrowRight size={12} />
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 sm:-ml-4 z-30 bg-white border border-zinc-300 text-zinc-900 p-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 hidden md:flex disabled:opacity-0"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 sm:-mr-4 z-30 bg-white border border-zinc-300 text-zinc-900 p-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 hidden md:flex disabled:opacity-0"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Section 3: Video Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="py-8 sm:py-12 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <SectionTitle
                eyebrow="See it in action"
                title="Styled for your everyday elegance"
                description="Discover how our curated pieces catch the light and complete your look."
              />
              <Link href="/shop" className="shrink-0 mb-4 sm:mb-8">
                <Button size="sm" variant="outline" className="gap-2 border-zinc-300 text-zinc-900 bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 rounded-none px-6 h-10 text-xs font-bold uppercase tracking-widest transition-all">
                  Shop the Look <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:gap-6 w-full mx-auto">
                {[
                  { src: "/videos/Evileye%20neckless.mp4", tag: "Necklaces" },
                  { src: "/videos/Bangle.mp4", tag: "Bangles" },
                  { src: "/videos/Rings.mp4", tag: "Rings" }
                ].map((video, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: idx * 0.2, ease: "easeOut" }}
                    className="relative aspect-[4/5] overflow-hidden group bg-[#FCFBF9] border border-zinc-200 flex items-center justify-center transition-all duration-500 hover:border-zinc-900"
                    onMouseEnter={(e) => {
                      const videoEl = e.currentTarget.querySelector('.desktop-video') as HTMLVideoElement;
                      if (videoEl) videoEl.play().catch(() => { });
                    }}
                    onMouseLeave={(e) => {
                      const videoEl = e.currentTarget.querySelector('.desktop-video') as HTMLVideoElement;
                      if (videoEl) videoEl.pause();
                    }}
                  >
                    {/* Mobile Video: Autoplays */}
                    <video
                      src={video.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="sm:hidden relative z-10 w-full h-full object-cover transition-transform duration-700"
                    />
                    {/* Desktop Video: Plays on hover */}
                    <video
                      src={video.src}
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="desktop-video hidden sm:block relative z-10 w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute inset-0 z-30 flex items-end justify-center pb-12 pointer-events-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                      <p
                        className="text-zinc-900 text-4xl sm:text-6xl"
                        style={{ fontFamily: "'Palace Script MT', cursive" }}
                      >
                        {video.tag}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 4: Featured Collection */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          id="shop"
          className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 lg:px-8 border-t border-zinc-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow="Featured collection"
              title="Handpicked jewelry that feels extraordinary"
              description="From premium 18K gold plated necklaces to elegant earrings, each piece is designed to delight."
            />
            <Link href="/shop" className="shrink-0 mb-4 sm:mb-8">
              <Button size="sm" variant="outline" className="gap-2 border border-zinc-300 text-zinc-900 bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 px-6 h-12 transition-all font-bold uppercase tracking-[0.2em] text-xs">
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-9000 bg-white border border-zinc-200 shadow-sm">
                No products have been pinned to the homepage yet.
              </div>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard
                    id={product.id}
                    priority={index < 4}
                    name={product.name}
                    price={`Rs. ${Math.round(product.price).toLocaleString('en-US')}`}
                    description={product.description}
                    badge={product.isFeaturedThisWeek ? "Featured" : undefined}
                    image={product.image || "/images/gift-basket.svg"}
                    isOutOfStock={product.isOutOfStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
                    onShopClick={(quantity) => addToCart(product, undefined, quantity)}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Section 5: Why Lucky Balls */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          id="about"
          className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 lg:px-8 border-t border-zinc-200 mt-8 bg-white"
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6">
                A polished experience from first click to delivery.
              </h2>
              <Link href="/about" className="mt-6 inline-block">
                <Button variant="custom" className="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white rounded-none px-8 h-12 text-xs font-bold uppercase tracking-widest transition-all">
                  Read our full story
                </Button>
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 relative z-10">
              {highlights.map((item) => {
                return (
                  <div key={item.title} className="p-2">
                    <h3 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-500 font-light">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Section 5: Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          id="reviews"
          className="py-6 sm:py-10"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <SectionTitle
                eyebrow="Customer love"
                title="Loved by besties planning birthdays, weddings, and everyday surprises"
              />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <ReviewBox messages={REVIEW_COL_1} delay={0} />
              <div className="hidden md:block">
                <ReviewBox messages={REVIEW_COL_2} delay={1000} />
              </div>
              <div className="hidden lg:block">
                <ReviewBox messages={REVIEW_COL_3} delay={2000} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 6: Join the Community */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="mt-8 sm:mt-16 w-full"
        >
          <div className="bg-[#FCFBF9] border-t border-zinc-200 text-center py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-6xl font-serif italic text-zinc-500 mb-6 uppercase tracking-[0.05em]">Join the Club</h2>
              <p className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed">
                Be the first to know about exclusive drops, behind-the-scenes content, and styling tips. Follow us on Facebook and TikTok.
              </p>
              <div className="flex justify-center gap-6">
                <a href="https://www.facebook.com/share/1DDmyjedcE/" target="_blank" rel="noopener noreferrer">
                  <button className="inline-flex items-center justify-center w-14 h-14 bg-zinc-900 text-white hover:bg-zinc-800 rounded-none transition-all" aria-label="Follow on Facebook">
                    <svg viewBox="0 0 320 512" className="w-5 h-5" fill="currentColor"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
                  </button>
                </a>
                <a href="https://www.tiktok.com/@lucky.balls?_r=1&_t=ZS-97fRtHuHIiD" target="_blank" rel="noopener noreferrer">
                  <button className="inline-flex items-center justify-center w-14 h-14 bg-zinc-900 text-white hover:bg-zinc-800 rounded-none transition-all" aria-label="Follow on TikTok">
                    <svg viewBox="0 0 448 512" className="w-5 h-5" fill="currentColor"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" /></svg>
                  </button>
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {selectedProduct && (
        <CustomizeModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <Footer />
    </div>
  );
}


