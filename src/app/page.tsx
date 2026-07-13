"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Sparkles, Truck, Heart, Camera, ThumbsUp, ChevronLeft, ChevronRight, Star } from "lucide-react";
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
    icon: Truck,
    title: "Fast local delivery",
    description: "Reliable dispatch and same-day processing for most orders.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Flexible cash-on-delivery with a smooth, modern order flow.",
  },
  {
    icon: HeartHandshake,
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
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 shadow-sm hover:border-pink-500/30 transition-all h-[240px] md:h-[320px] flex flex-col relative overflow-hidden">
      <div className="flex gap-1 mb-2 z-20">
        {[...Array(5)].map((_, i) => <Heart key={i} size={16} className="text-rose-600" fill="currentColor" />)}
      </div>
      <div className="relative flex-1">
        {messages.map(([quote, name], idx) => {
          let transformClass = "opacity-0 translate-y-8";
          if (idx === currentIndex) {
            transformClass = "opacity-100 translate-y-0";
          } else if (idx === (currentIndex - 1 + messages.length) % messages.length) {
            transformClass = "opacity-0 -translate-y-8";
          }

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col justify-center ${transformClass}`}
            >
              <p className="text-base md:text-lg leading-relaxed text-zinc-700 font-medium italic">{quote}</p>
              <p className="mt-3 md:mt-4 font-bold text-rose-600 text-xs md:text-sm tracking-wide uppercase">{name}</p>
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
    <div className="min-h-screen font-sans selection:bg-pink-500/30 text-zinc-900">
      <Navbar />
      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="mx-auto grid max-w-7xl gap-6 sm:gap-8 px-4 sm:px-6 pt-20 sm:pt-28 pb-6 sm:pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-32 lg:pb-16 relative">
          <div className="absolute top-10 right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex flex-col justify-center relative z-10 text-center lg:text-left items-center lg:items-start">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-pink-500/30 bg-white/80 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-medium text-rose-600 shadow-[0_0_15px_rgba(219,39,119,0.2)]">
              <Sparkles size={16} className="text-rose-600" />
              18K Gold Plated Jewellery
            </div>
            <h1 className="max-w-2xl text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 lg:text-6xl drop-shadow-md">
              Beautiful jewellery delivered with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">elegance.</span>
            </h1>
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-8 text-zinc-600">
              Lucky Balls brings together curated 18K gold plated pieces, premium pink packaging, and a seamless shopping experience for everyday luxury.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full lg:w-auto">
              <Link href="/shop" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto gap-1 sm:gap-2 bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.5)] transition-all duration-300 rounded-full px-4 sm:px-8 hover:-translate-y-1 whitespace-nowrap text-sm sm:text-base">
                  Shop Now <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Button>
              </Link>
              <Link href="/about" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto gap-1 sm:gap-2 bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.5)] transition-all duration-300 rounded-full px-4 sm:px-8 hover:-translate-y-1 whitespace-nowrap text-sm sm:text-base">
                  Our Story
                </Button>
              </Link>
            </div>
            <div className="mt-8 sm:mt-10 flex flex-row items-center justify-center lg:justify-start gap-8 sm:gap-12 w-full lg:w-auto">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-bold text-zinc-900">500+</span>
                <span className="text-[10px] sm:text-xs font-medium text-zinc-500 mt-0.5 text-center lg:text-left">Happy Customers</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-bold text-zinc-900">250+</span>
                <span className="text-[10px] sm:text-xs font-medium text-zinc-500 mt-0.5 text-center lg:text-left">Products</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-bold text-zinc-900">4.9</span>
                <span className="text-[10px] sm:text-xs font-medium text-zinc-500 mt-0.5 text-center lg:text-left">Avg. Rating</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end lg:pl-10 mt-8 lg:mt-0">
            <div className="relative w-full max-w-[260px] sm:max-w-sm md:max-w-md aspect-[4/5] overflow-hidden border border-pink-500/20 bg-white/40 backdrop-blur-sm p-2 shadow-[0_0_50px_rgba(219,39,119,0.2)] group hover:shadow-[0_0_70px_rgba(219,39,119,0.4)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent pointer-events-none"></div>
              <div className="h-full w-full bg-white/80 border border-zinc-200 flex items-center justify-center overflow-hidden">
                {featuredItem ? (
                  <Image
                    src={featuredItem.image || "/images/gift-basket.svg"}
                    alt={featuredItem.name}
                    width={500}
                    height={600}
                    priority
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full text-zinc-400">
                    <Sparkles className="mb-2 opacity-30" size={48} />
                    <p>No featured item</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 border border-pink-500/30 px-4 py-3 shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <div className="overflow-hidden pr-2">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">This week&apos;s feature</p>
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {featuredItem ? featuredItem.name : "Select a featured item"}
                    </p>
                  </div>
                  {featuredItem && (
                    <Link href={`/product/${featuredItem.id}`}>
                      <Button size="icon" className="bg-pink-600 hover:bg-pink-700 rounded-none text-white shadow-md hover:scale-105 transition-transform h-9 w-9 shrink-0">
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Browse By Category */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">Shop by Category</h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-zinc-600">Find exactly what you're looking for, from delicate earrings to bold statement pieces.</p>
            </div>

            <div className="relative group">
              <div
                ref={scrollContainerRef}
                className="grid grid-flow-col auto-cols-[140px] sm:auto-cols-[180px] md:auto-cols-[calc(25%-12px)] lg:auto-cols-[calc(25%-24px)] gap-3 sm:gap-4 lg:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {loading ? (
                  <div className="col-span-full flex justify-center py-10 w-[90vw]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-zinc-500 w-[90vw]">Categories will appear here.</div>
                ) : (
                  categories.map((cat, index) => (
                    <Link href={`/shop?category=${cat.id}`} key={cat.id} className="group block relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-sm aspect-square border border-zinc-200 snap-start">
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-pink-900/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80"></div>

                      {/* Category Image */}
                      <div className="w-full h-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                        <Image
                          src={cat.image || `/images/gift-basket.svg`}
                          alt={cat.name}
                          width={400}
                          height={400}
                          className={`object-cover w-full h-full ${cat.image ? '' : 'opacity-60 mix-blend-multiply'}`}
                        />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-zinc-900 font-bold text-lg sm:text-xl lg:text-2xl drop-shadow-md">{cat.name}</h3>
                        <p className="text-pink-100 text-xs sm:text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-1">
                          Explore <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 sm:-ml-4 z-30 bg-white/90 shadow-lg border border-pink-100 text-pink-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-50 hover:scale-110 hidden md:flex disabled:opacity-0"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 sm:-mr-4 z-30 bg-white/90 shadow-lg border border-pink-100 text-pink-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-50 hover:scale-110 hidden md:flex disabled:opacity-0"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Video Showcase */}
        <section className="py-10 sm:py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <SectionTitle
                eyebrow="See it in action"
                title="Styled for your everyday elegance"
                description="Discover how our curated pieces catch the light and complete your look."
              />
              <Link href="/shop" className="shrink-0 mb-4 sm:mb-8">
                <Button size="sm" variant="outline" className="gap-2 border-pink-200 text-rose-600 hover:bg-pink-50 hover:text-rose-600 rounded-full px-6 transition-all hover:pr-4">
                  Shop the Look <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:gap-6 w-full mx-auto">
                {[
                  { src: "/videos/Evileye neckless.mp4", tag: "Evil Eye Necklace" },
                  { src: "/videos/Bangle.mp4", tag: "Bangles" },
                  { src: "/videos/Rings.mp4", tag: "Rings" }
                ].map((video, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/5] overflow-hidden group bg-zinc-100 flex items-center justify-center shadow-md border border-zinc-100 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500"
                    onMouseEnter={(e) => {
                      const videoEl = e.currentTarget.querySelector('.desktop-video') as HTMLVideoElement;
                      if (videoEl) videoEl.play().catch(() => {});
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
                      className="sm:hidden relative z-10 w-full h-full object-cover transition-transform duration-700"
                    />
                    {/* Desktop Video: Plays on hover */}
                    <video
                      src={video.src}
                      loop
                      muted
                      playsInline
                      className="desktop-video hidden sm:block relative z-10 w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 z-30 flex items-end justify-center pb-4 sm:pb-8 pointer-events-none opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <p
                        className="text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight text-center w-full"
                        style={{ fontFamily: "'Palace Script MT', 'Brush Script MT', cursive" }}
                      >
                        {video.tag}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Featured Collection */}
        <section id="shop" className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow="Featured collection"
              title="Handpicked jewelry that feels extraordinary"
              description="From premium 18K gold plated necklaces to elegant earrings, each piece is designed to delight."
            />
            <Link href="/shop" className="shrink-0 mb-4 sm:mb-8">
              <Button size="sm" variant="outline" className="gap-2 border-pink-200 text-rose-600 hover:bg-pink-50 hover:text-rose-600 rounded-full px-6 transition-all hover:pr-4">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-500 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                No products have been pinned to the homepage yet.
              </div>
            ) : (
              products.map((product, index) => (
                <ProductCard
                  key={product.id}
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
              ))
            )}
          </div>
        </section>

        {/* Section 5: Why Lucky Balls */}
        <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 lg:px-8">
          <div className="grid gap-6 sm:gap-8 border border-pink-500/20 bg-white/40 backdrop-blur-md p-6 sm:p-8 shadow-xl lg:grid-cols-[0.9fr_1.1fr] lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col justify-center">
              <SectionTitle
                eyebrow="Why Lucky Balls"
                title="A polished shopping experience from first click to delivery"
              />
              <Link href="/about" className="mt-8">
                <Button variant="ghost" className="text-rose-600 hover:text-rose-600 hover:bg-pink-50 pl-0 gap-2">
                  Read our full story <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 relative z-10">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-zinc-100 bg-white/50 backdrop-blur-sm p-6 hover:border-pink-500/30 transition-colors">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 border border-pink-100 text-rose-600 shadow-sm">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-zinc-900 text-lg">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5: Reviews */}
        <section id="reviews" className="py-8 sm:py-12">
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
        </section>

        {/* Section 6: Join the Community */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-12 lg:px-8 mb-6 sm:mb-12">
          <div className="bg-gradient-to-br from-pink-600 to-pink-900 text-center py-8 sm:py-16 px-4 sm:px-6 relative overflow-hidden shadow-2xl rounded-2xl sm:rounded-3xl">
            {/* Decorative circles */}
            <div className="absolute -top-16 -left-16 sm:-top-24 sm:-left-24 w-48 h-48 sm:w-64 sm:h-64 border-[20px] sm:border-[30px] border-white/10 rounded-full"></div>
            <div className="absolute -bottom-16 -right-16 sm:-bottom-24 sm:-right-24 w-60 h-60 sm:w-80 sm:h-80 border-[30px] sm:border-[40px] border-white/10 rounded-full"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8 shadow-lg">
                <ThumbsUp className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-6">Join the Lucky Balls Club</h2>
              <p className="text-pink-100 text-sm sm:text-lg mb-6 sm:mb-10 leading-relaxed px-2">
                Be the first to know about exclusive drops, behind-the-scenes content, and styling tips. Follow us on Facebook and TikTok to join thousands of besties!
              </p>
              <div className="flex justify-center gap-4 sm:gap-6">
                <a href="https://www.facebook.com/share/1DDmyjedcE/" target="_blank" rel="noopener noreferrer">
                  <button className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white hover:bg-blue-700 border-none rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all" aria-label="Follow on Facebook">
                    <svg viewBox="0 0 320 512" className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
                  </button>
                </a>
                <a href="https://www.tiktok.com/@lucky.balls?_r=1&_t=ZS-97fRtHuHIiD" target="_blank" rel="noopener noreferrer">
                  <button className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-black text-white hover:bg-zinc-800 border-none rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all" aria-label="Follow on TikTok">
                    <svg viewBox="0 0 448 512" className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" /></svg>
                  </button>
                </a>
              </div>
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

