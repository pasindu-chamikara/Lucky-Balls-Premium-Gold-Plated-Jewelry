"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionTitle } from "@/components/section-title";
import { ProductCard } from "@/components/product-card";
import { CustomizeModal } from "@/components/customize-modal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useCart } from "@/context/cart-context";
import { Search, Filter } from "lucide-react";

type Subcategory = { id: string; name: string; slug: string; };
type Category = { id: string; name: string; slug: string; subcategories: Subcategory[]; };

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
  targetGender?: "mens" | "womens" | "both" | "";
  isOutOfStock?: boolean;
  stockQuantity?: number;
};

function ShopContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchStoreData() {
      try {
        const [catSnap, prodSnap] = await Promise.all([
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "products"))
        ]);
        const allCategories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        const allProducts = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setCategories(allCategories);
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreData();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const categoryIdParam = searchParams.get('category');
      const categoryNameParam = searchParams.get('categoryName');

      if (categoryIdParam) {
        setSelectedCategory(categoryIdParam);
      } else if (categoryNameParam) {
        const found = categories.find(c => c.name.toLowerCase() === categoryNameParam.toLowerCase());
        if (found) {
          setSelectedCategory(found.id);
        }
      } else {
        setSelectedCategory("all");
      }
    }
  }, [searchParams, categories]);

  const filteredProducts = products.filter(product => {
    // 1. Search Query
    const query = (searchQuery || "").toLowerCase();
    const nameMatch = (product.name || "").toLowerCase().includes(query);
    const descMatch = (product.description || "").toLowerCase().includes(query);
    if (!nameMatch && !descMatch) return false;

    // 2. Category
    if (selectedCategory !== "all" && product.categoryId !== selectedCategory) return false;

    // 3. Audience
    if (selectedAudience !== "all") {
      const pGender = product.targetGender || "both";
      if (selectedAudience === "mens" && pGender !== "mens" && pGender !== "both") return false;
      if (selectedAudience === "womens" && pGender !== "womens" && pGender !== "both") return false;
      if (selectedAudience === "both" && pGender !== "both") return false;
    }

    // 4. Price
    if (selectedPrice !== "all") {
      if (selectedPrice === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (selectedPrice === "1000-1500" && (product.price < 1000 || product.price > 1500)) return false;
      if (selectedPrice === "1500-2000" && (product.price < 1500 || product.price > 2000)) return false;
      if (selectedPrice === "over-2000" && product.price <= 2000) return false;
    }

    return true;
  }).sort((a, b) => {
    const aOutOfStock = a.isOutOfStock || (a.stockQuantity !== undefined && a.stockQuantity <= 0);
    const bOutOfStock = b.isOutOfStock || (b.stockQuantity !== undefined && b.stockQuantity <= 0);
    if (aOutOfStock === bOutOfStock) return 0;
    return aOutOfStock ? 1 : -1;
  });

  return (
    <div className="min-h-screen text-zinc-900 bg-[#FCFBF9] font-sans selection:bg-[var(--accent)]/30 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl px-6 pt-28 pb-16 lg:px-8 w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl drop-shadow-sm mb-4">
            The Shop
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
            Browse our entire collection of handpicked, 18K gold plated pieces designed to bring everyday luxury into your life.
          </p>
          
          <div className="max-w-md mx-auto relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-full leading-5 bg-white/80 backdrop-blur-sm placeholder-zinc-500 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] sm:text-sm shadow-sm transition-all"
              placeholder="Search for jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-4 w-full max-w-3xl mx-auto overflow-x-auto pb-4 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex shrink-0 items-center gap-2 text-sm text-zinc-600 bg-white/50 border border-zinc-200 rounded-lg px-3 py-2 backdrop-blur-sm shadow-sm snap-start">
              <Filter size={16} /> Filters:
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white shrink-0 border border-zinc-200 text-zinc-700 text-sm rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] block px-3 py-2 shadow-sm transition-all hover:border-[var(--accent)] snap-start"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="bg-white shrink-0 border border-zinc-200 text-zinc-700 text-sm rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] block px-3 py-2 shadow-sm transition-all hover:border-[var(--accent)] snap-start"
            >
              <option value="all">All Audiences</option>
              <option value="womens">Women's</option>
              <option value="mens">Men's</option>
              <option value="both">Unisex</option>
            </select>

            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="bg-white shrink-0 border border-zinc-200 text-zinc-700 text-sm rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] block px-3 py-2 shadow-sm transition-all hover:border-[var(--accent)] snap-start"
            >
              <option value="all">Any Price</option>
              <option value="500-1000">Rs. 500 - Rs. 1000</option>
              <option value="1000-1500">Rs. 1000 - Rs. 1500</option>
              <option value="1500-2000">Rs. 1500 - Rs. 2000</option>
              <option value="over-2000">Over Rs. 2000</option>
            </select>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-zinc-600">
              {searchQuery ? `No products found matching "${searchQuery}".` : "No products available at the moment. Please check back soon!"}
            </div>
          ) : (
            filteredProducts.map((product, index) => (
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
      </main>
      
      {selectedProduct && (
        <CustomizeModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]"><p>Loading shop...</p></div>}>
      <ShopContent />
    </Suspense>
  );
}
