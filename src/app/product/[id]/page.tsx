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
      <div className="min-h-screen bg-[#FAF8F5] font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1F1F1F] border-t-transparent"></div>
            <p className="text-[#1F1F1F]/60 text-xs uppercase tracking-widest">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-[#1F1F1F] mb-4">Product Not Found</h2>
            <p className="text-[#1F1F1F]/60 mb-8 font-light">The product you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/shop")} className="rounded-none bg-transparent border border-[#1F1F1F] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#FAF8F5] uppercase tracking-widest text-[10px] h-12 px-8">
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
    <div className="min-h-screen bg-[#FAF8F5] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-[1100px] px-4 md:px-6 pt-20 md:pt-32 pb-4 lg:px-12 lg:pb-6 w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#1F1F1F]/60 hover:text-[#1F1F1F] mb-4 transition-colors text-[10px] uppercase tracking-widest font-medium"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8 items-start justify-center">
          <div className="relative aspect-square w-full max-w-[400px] mx-auto md:ml-auto md:mr-0">
            <Image
              src={product.image || "/images/gift-basket.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-contain transition-transform duration-700 hover:scale-105 ${isOutOfStock ? "grayscale opacity-70" : ""}`}
              priority
            />
            {product.isFeaturedThisWeek && !isOutOfStock && (
              <span className="absolute top-6 left-6 z-10 bg-[#1F1F1F] text-white px-3 py-1 text-[9px] uppercase tracking-widest">
                Featured
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-6 left-6 z-10 bg-[#EDE5DF] text-[#1F1F1F] px-3 py-1 text-[9px] uppercase tracking-widest">
                Out of Stock
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col py-2 md:py-6 lg:py-8 max-w-md mx-auto md:mx-0 w-full">
            <p className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 mb-3">By Lucky Balls</p>
            <h1 className="text-2xl md:text-3xl font-serif text-[#1F1F1F] mb-3 leading-tight">
              {product.name}
            </h1>
            
            <p className="text-base font-medium text-[#1F1F1F] mb-6">
              LKR {Math.round(product.price).toLocaleString('en-US')}
            </p>
            
            <div className="mb-6">
              <p className="font-serif italic text-base leading-relaxed text-[#1F1F1F]/80 whitespace-pre-wrap">{product.description}</p>
            </div>
            
            {!isOutOfStock ? (
              <div className="mt-auto space-y-6">
                <div className="flex flex-row md:flex-row gap-3 md:gap-4 w-full">
                  <div className="flex items-center border border-[#1F1F1F] bg-transparent h-12 md:h-10 w-32 md:w-28 shrink-0">
                    <button
                      onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                      className="px-4 h-full text-[#1F1F1F] hover:bg-[#1F1F1F]/5 transition-colors disabled:opacity-30 flex items-center justify-center"
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="flex-1 text-center font-medium text-[#1F1F1F] text-sm md:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-4 h-full text-[#1F1F1F] hover:bg-[#1F1F1F]/5 transition-colors flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 h-12 md:h-10 rounded-none bg-[#1F1F1F] text-white hover:bg-[#D6A77A] uppercase tracking-widest text-[10px] font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingToCart ? "Added!" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-auto">
                <div className="border border-[#1F1F1F]/10 bg-white p-6 text-center">
                  <p className="font-medium text-[#1F1F1F] mb-2 text-sm uppercase tracking-widest">Out of Stock</p>
                  <p className="text-xs text-[#1F1F1F]/60 font-light">We're working hard to restock this beautiful piece.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-[#1F1F1F]/10">
            <h2 className="text-2xl md:text-3xl font-serif text-[#1F1F1F] mb-6">You might also like</h2>
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
