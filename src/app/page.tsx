"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Sparkles, Truck, Heart, Camera, ThumbsUp } from "lucide-react";
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
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm hover:border-pink-500/30 transition-all h-[320px] flex flex-col relative overflow-hidden">
       <div className="flex gap-1 mb-2 z-20">
         {[...Array(5)].map((_, i) => <Heart key={i} size={16} className="text-pink-500" fill="currentColor" />)}
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
               <p className="text-lg leading-relaxed text-zinc-700 font-medium italic">{quote}</p>
               <p className="mt-4 font-bold text-pink-600 text-sm tracking-wide uppercase">{name}</p>
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

  useEffect(() => {
    async function fetchStoreData() {
      try {
        const [prodSnap, catSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(query(collection(db, "categories"), orderBy("name")))
        ]);
        
        const allProducts = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const allCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        
        // Filter to only show pinned products, up to 3
        const pinnedProducts = allProducts.filter(p => p.isPinnedForHome).slice(0, 3);
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-pink-500/30">
      <Navbar />
      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28 relative">
          <div className="absolute top-10 right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex flex-col justify-center relative z-10">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-pink-500/30 bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-medium text-pink-600 shadow-[0_0_15px_rgba(219,39,119,0.2)]">
              <Sparkles size={16} className="text-pink-500" />
              18K Gold Plated Jewellery
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl drop-shadow-md">
              Beautiful jewellery delivered with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">elegance.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Lucky Balls brings together curated 18K gold plated pieces, premium pink packaging, and a seamless shopping experience for everyday luxury.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/shop">
                <Button size="lg" className="gap-2 bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.5)] transition-all duration-300 rounded-full px-8 hover:-translate-y-1">
                  Shop Now <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-600">
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-zinc-200">
                <Heart size={16} className="text-pink-500" fill="currentColor" />
                Trusted by 10k+ besties
              </div>
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-zinc-200">
                <BadgeCheck size={16} className="text-pink-500" />
                Custom aesthetic bundles
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-pink-500/20 bg-white p-2 shadow-[0_0_50px_rgba(219,39,119,0.2)] group hover:shadow-[0_0_70px_rgba(219,39,119,0.4)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent pointer-events-none"></div>
            <div className="h-full w-full rounded-[2rem] bg-white/80 border border-zinc-200 flex items-center justify-center overflow-hidden">
               {featuredItem ? (
                 <Image
                   src={featuredItem.image || "/images/gift-basket.svg"}
                   alt={featuredItem.name}
                   width={700}
                   height={700}
                   priority
                   className="w-full h-full object-cover rounded-[2rem] opacity-80 group-hover:scale-105 transition-transform duration-700"
                 />
               ) : (
                 <div className="flex flex-col items-center justify-center h-full w-full text-zinc-400">
                   <Sparkles className="mb-2 opacity-30" size={48} />
                   <p>No featured item</p>
                 </div>
               )}
            </div>
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/80 border border-pink-500/30 px-5 py-4 shadow-xl backdrop-blur-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1">This week&apos;s feature</p>
                  <p className="text-base font-semibold text-zinc-900 truncate">
                    {featuredItem ? featuredItem.name : "Select a featured item"}
                  </p>
                </div>
                {featuredItem && (
                  <Link href={`/shop?product=${featuredItem.id}`}>
                    <Button size="icon" className="bg-pink-600 hover:bg-pink-700 rounded-full text-white shadow-md hover:scale-105 transition-transform h-10 w-10 shrink-0">
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Browse By Category */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Shop by Category</h2>
              <p className="mt-4 text-zinc-600">Find exactly what you're looking for, from delicate earrings to bold statement pieces.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
              {loading ? (
                <div className="col-span-full flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="col-span-full text-center py-10 text-zinc-500">Categories will appear here.</div>
              ) : (
                categories.slice(0, 4).map((cat, index) => (
                  <Link href={`/shop?category=${cat.id}`} key={cat.id} className="group block relative overflow-hidden rounded-3xl bg-zinc-100 aspect-square border border-zinc-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-pink-900/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80"></div>
                    
                    {/* Category Image */}
                    <div className="w-full h-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                       <Image 
                         src={cat.image || `/images/gift-basket.svg`} 
                         alt={cat.name} 
                         width={400} 
                         height={400} 
                         className={`object-cover w-full h-full ${cat.image ? 'opacity-90' : 'opacity-60 mix-blend-multiply'}`} 
                       />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-xl lg:text-2xl">{cat.name}</h3>
                      <p className="text-pink-100 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-1">
                        Explore <ArrowRight size={14} />
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Featured Collection */}
        <section id="shop" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow="Featured collection"
              title="Handpicked jewelry that feels extraordinary"
              description="From premium 18K gold plated necklaces to elegant earrings, each piece is designed to delight."
            />
            <Link href="/shop" className="shrink-0 mb-4 sm:mb-8">
              <Button size="sm" variant="outline" className="gap-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 rounded-full px-6 transition-all hover:pr-4">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-500 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                No products have been pinned to the homepage yet.
              </div>
            ) : (
              products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  name={product.name}
                  price={`Rs. ${product.price.toFixed(2)}`}
                  description={product.description}
                  badge={product.isFeaturedThisWeek ? "Featured" : undefined}
                  image={product.image || "/images/gift-basket.svg"}
                  isOutOfStock={product.isOutOfStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
                  onShopClick={(quantity) => addToCart(product, undefined, quantity)}
                  onImageClick={() => setSelectedProduct(product)}
                />
              ))
            )}
          </div>
        </section>

        {/* Section 4: Why Lucky Balls */}
        <section id="about" className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid gap-8 rounded-[2.5rem] border border-pink-500/20 bg-white p-8 shadow-xl lg:grid-cols-[0.9fr_1.1fr] lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col justify-center">
              <SectionTitle
                eyebrow="Why Lucky Balls"
                title="A polished shopping experience from first click to delivery"
              />
              <Link href="/about" className="mt-8">
                <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 pl-0 gap-2">
                  Read our full story <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 relative z-10">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-zinc-100 bg-zinc-50 p-6 hover:border-pink-500/30 transition-colors">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-pink-100 text-pink-600 shadow-sm">
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
        <section id="reviews" className="bg-white py-20 mt-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionTitle
                eyebrow="Customer love"
                title="Loved by besties planning birthdays, weddings, and everyday surprises"
              />
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3">
              <ReviewBox messages={REVIEW_COL_1} delay={0} />
              <ReviewBox messages={REVIEW_COL_2} delay={1000} />
              <ReviewBox messages={REVIEW_COL_3} delay={2000} />
            </div>
          </div>
        </section>
        
        {/* Section 6: Join the Community */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-[3rem] bg-gradient-to-br from-pink-600 to-pink-900 text-center py-20 px-6 relative overflow-hidden shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute -top-24 -left-24 w-64 h-64 border-[30px] border-white/10 rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 border-[40px] border-white/10 rounded-full"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <ThumbsUp size={32} className="text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">Join the Lucky Balls Club</h2>
              <p className="text-pink-100 text-lg mb-10 leading-relaxed">
                Be the first to know about exclusive drops, behind-the-scenes content, and styling tips. Follow us on Facebook and TikTok to join thousands of besties!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="https://www.facebook.com/share/1DDmyjedcE/" target="_blank" rel="noopener noreferrer">
                  <button className="inline-flex items-center justify-center w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 border-none rounded-full px-8 font-bold text-base h-14 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all">
                    Follow on Facebook
                  </button>
                </a>
                <a href="https://www.tiktok.com/@lucky.balls?_r=1&_t=ZS-97fRtHuHIiD" target="_blank" rel="noopener noreferrer">
                  <button className="inline-flex items-center justify-center w-full sm:w-auto bg-black text-white hover:bg-zinc-800 border-none rounded-full px-8 font-bold text-base h-14 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all">
                    Follow on TikTok
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

