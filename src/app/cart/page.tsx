"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

export default function CartPage() {
  const { cart, removeFromCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  useEffect(() => {
    const fetchShippingFee = async () => {
      try {
        const configSnap = await getDoc(doc(db, "settings", "store_config"));
        if (configSnap.exists()) {
          setShippingFee(configSnap.data().shippingFee || 0);
        } else {
          setShippingFee(0);
        }
      } catch (error) {
        console.error("Error fetching shipping fee:", error);
        setShippingFee(0);
      }
    };
    fetchShippingFee();
  }, []);

  return (
    <div className="flex min-h-screen flex-col text-zinc-900">
      <Navbar />
      <main className="flex-1 px-6 pt-28 pb-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Your <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Cart</span>
          </h1>
          
          {cart.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-pink-500/20 bg-white/50 p-8 text-center shadow-[0_0_15px_rgba(219,39,119,0.1)] backdrop-blur-sm">
              <ShoppingBag className="mb-4 h-16 w-16 text-rose-600/50" />
              <h2 className="mb-2 text-2xl font-semibold">Your cart is currently empty</h2>
              <p className="mb-8 text-zinc-700">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link href="/#shop">
                <Button className="bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_10px_rgba(219,39,119,0.4)] transition-all">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white/50 p-4 shadow-md backdrop-blur-sm">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      <Image 
                        src={item.image || "/images/gift-basket.svg"} 
                        alt={item.name} 
                        fill 
                        sizes="96px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900">{item.name}</h3>
                          {item.choices && Object.entries(item.choices).map(([key, value]) => (
                            <p key={key} className="text-sm text-zinc-700">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}
                            </p>
                          ))}
                        </div>
                        <p className="text-lg font-bold text-rose-600">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-zinc-700">Qty: {item.quantity}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-zinc-700 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white/50 p-6 shadow-md backdrop-blur-sm h-fit">
                <h3 className="text-xl font-bold text-zinc-900 mb-6 border-b border-zinc-200 pb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-zinc-700">
                    <span>Subtotal</span>
                    <span>Rs. {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Shipping</span>
                    <span>{shippingFee === null ? "..." : shippingFee === 0 ? "Free" : `Rs. ${shippingFee.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold text-zinc-900 mb-8 border-t border-zinc-200 pt-4">
                  <span>Total</span>
                  <span className="text-rose-600">Rs. {(totalPrice + (shippingFee || 0)).toFixed(2)}</span>
                </div>
                <Link href={user ? "/checkout" : "/login?redirect=/checkout"} className="block mt-6">
                  <Button className="w-full bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.3)] transition-all py-6 text-lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
