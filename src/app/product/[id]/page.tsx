"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useCart } from "@/context/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          
          const q = query(
            collection(db, "products"),
            limit(15) // Fetch 15 to have enough after filtering
          );
          const querySnapshot = await getDocs(q);
          const allDocs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() as any }))
            .filter(p => p.id !== productId && !p.isOutOfStock && (p.stockQuantity === undefined || p.stockQuantity > 0));
          
          // Try to sort by category if possible, then random
          allDocs.sort(() => 0.5 - Math.random());
          
          setRelatedProducts(allDocs.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    addToCart({ ...product, price: Number(product.price) || 0 }, undefined, quantity);
    setTimeout(() => {
      setAddingToCart(false);
      router.push("/cart");
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
            <p className="text-zinc-500 font-medium tracking-wide">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Product Not Found</h2>
            <p className="text-zinc-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/shop")} className="bg-[#E5C98F] hover:bg-[#BD9142] text-zinc-900">
              Back to Shop
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.isOutOfStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  return (
    <div className="min-h-screen bg-[#FCFBF9] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12 w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-[#BD9142] mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 mb-12">
          <div className="relative aspect-square md:aspect-auto md:h-[320px] lg:h-[450px] rounded-3xl overflow-hidden shadow-xl shadow-pink-500/5 border border-zinc-200/60 max-w-[260px] sm:max-w-sm md:max-w-md mx-auto md:mx-0 w-full">
            <Image
              src={product.image || "/images/gift-basket.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-contain scale-[0.85] ${isOutOfStock ? "grayscale" : ""}`}
              priority
            />
            {product.isFeaturedThisWeek && !isOutOfStock && (
              <span className="absolute top-6 left-6 z-10 rounded-full bg-rose-500 text-zinc-900 px-4 py-1.5 text-sm font-bold shadow-md">
                Featured
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-6 left-6 z-10 rounded-full bg-zinc-800 text-zinc-900 px-4 py-1.5 text-sm font-bold shadow-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col py-4 md:py-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mb-4">
              {product.name}
            </h1>
            
            <p className="text-2xl sm:text-3xl font-bold text-rose-600 mb-6">
              Rs. {Math.round(product.price).toLocaleString('en-US')}
            </p>
            
            <div className="prose prose-zinc mb-8 max-w-none text-zinc-600">
              <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
            
            {!isOutOfStock ? (
              <div className="mt-auto space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">Quantity</h3>
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-white w-fit h-12 shadow-sm">
                    <button
                      onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                      className="px-4 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50 rounded-l-xl flex items-center justify-center"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-semibold text-zinc-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-4 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-r-xl flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  variant="rose"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full sm:w-auto min-w-[200px] font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 gap-2"
                >
                  <ShoppingCart size={20} />
                  {addingToCart ? "Added!" : "Add to Cart"}
                </Button>
              </div>
            ) : (
              <div className="mt-auto">
                <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-6 text-center">
                  <p className="font-semibold text-zinc-700 mb-1">Currently Unavailable</p>
                  <p className="text-sm text-zinc-500">We're working hard to restock this beautiful piece.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-zinc-200">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">You might also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((p, index) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  priority={false}
                  name={p.name}
                  price={`Rs. ${Math.round(p.price).toLocaleString('en-US')}`}
                  description={p.description}
                  badge={p.isFeaturedThisWeek ? "Featured" : undefined}
                  image={p.image || "/images/gift-basket.svg"}
                  isOutOfStock={p.isOutOfStock || (p.stockQuantity !== undefined && p.stockQuantity <= 0)}
                  onShopClick={(q) => addToCart(p, undefined, q)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
