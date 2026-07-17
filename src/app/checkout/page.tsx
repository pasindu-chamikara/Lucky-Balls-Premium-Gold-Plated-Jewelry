"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useCart } from "@/context/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import emailjs from '@emailjs/browser';
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  address: z.string().min(5, "Delivery address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  // Guest checkout allowed - no redirect
  useEffect(() => {
    // Empty, or we can just remove the whole useEffect.
  }, []);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Prepare the order object
      // We must strip any 'undefined' values from the cart items because Firebase rejects undefined.
      const sanitizedCart = JSON.parse(JSON.stringify(cart));
      
      const order = {
        customerInfo: data,
        userId: user?.uid || null,
        items: sanitizedCart,
        totalPrice: totalPrice + (shippingFee || 0),
        shippingFee: shippingFee || 0,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      // Use a transaction to create the order, decrement stock, and auto-update isOutOfStock
      const orderRef = doc(collection(db, "orders"));
      
      await runTransaction(db, async (transaction) => {
        // Read all products first
        const productRefs = sanitizedCart
          .filter((item: any) => item.productId)
          .map((item: any) => ({
             ref: doc(db, "products", item.productId),
             quantity: item.quantity
          }));
          
        const productDocs = await Promise.all(
          productRefs.map((p: any) => transaction.get(p.ref))
        );
        
        // Write order
        transaction.set(orderRef, order);
        
        // Update products
        productDocs.forEach((pDoc, index) => {
          if (pDoc.exists()) {
            const currentStock = pDoc.data().stockQuantity || 0;
            const itemQty = productRefs[index].quantity || 1;
            const newStock = Math.max(0, currentStock - itemQty);
            
            transaction.update(pDoc.ref, {
              stockQuantity: newStock,
              isOutOfStock: newStock === 0
            });
          }
        });
      });
      
      // Send confirmation email via EmailJS
      try {
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
          const templateParams = {
            to_name: data.fullName,
            to_email: data.email,
            order_id: orderRef.id,
            total_price: (totalPrice + (shippingFee || 0)).toFixed(2),
            address: `${data.address}, ${data.city} ${data.postalCode}`,
            phone: data.phone,
            reply_to: "no-reply@luckyballs.com"
          };
          
          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          console.log("Order confirmation email sent.");
        } else {
          console.warn("EmailJS credentials missing. Check your .env.local file.");
        }
      } catch (emailError) {
        // We log the error but don't block the checkout completion
        console.error("Failed to send order confirmation email:", emailError);
      }
      
      setOrderId(orderRef.id);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Something went wrong while placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FCFBF9]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  // Guest checkout allowed

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col text-zinc-900 bg-[#FCFBF9]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6 pt-28 pb-20 lg:px-8">
          <div className="mx-auto max-w-md rounded-2xl border border-pink-500/30 bg-white/80 p-10 text-center shadow-[0_0_30px_rgba(219,39,119,0.15)] backdrop-blur-sm">
            <CheckCircle2 className="mx-auto mb-6 h-20 w-20 text-rose-600" />
            <h1 className="mb-4 text-3xl font-bold text-zinc-900">Order Confirmed!</h1>
            <p className="mb-2 text-lg text-zinc-700">Thank you for your purchase.</p>
            <p className="mb-2 text-sm text-zinc-700">
              Your order ID is: <span className="font-mono text-rose-600">{orderId}</span>
            </p>
            <p className="mb-8 text-sm font-medium text-rose-600">
              Please save your order ID for future reference.
            </p>
            <Link href="/">
              <Button className="w-full bg-[#E5C98F] text-zinc-900 hover:bg-[#BD9142] shadow-[0_0_15px_rgba(219,39,119,0.3)] transition-all">
                Return to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col text-zinc-900 bg-[#FCFBF9]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6 pt-28 pb-20 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-zinc-900">Your cart is empty</h1>
            <p className="mb-8 text-zinc-700">Please add items to your cart before checking out.</p>
            <Link href="/">
              <Button className="bg-[#E5C98F] text-zinc-900 hover:bg-[#BD9142]">Go to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col text-zinc-900 bg-[#FCFBF9]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-28 pb-12 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">Checkout</h1>
        
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Checkout Form */}
          <div className="rounded-2xl border border-zinc-200 bg-white/50 p-6 md:p-8 shadow-md backdrop-blur-sm">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900">Shipping Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-zinc-700">Full Name</label>
                  <input
                    {...register("fullName")}
                    type="text"
                    id="fullName"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">Email Address</label>
                    <input
                      {...register("email")}
                      type="email"
                      id="email"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700">Phone Number</label>
                    <input
                      {...register("phone")}
                      type="tel"
                      id="phone"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="mb-1 block text-sm font-medium text-zinc-700">Delivery Address</label>
                  <textarea
                    {...register("address")}
                    id="address"
                    rows={3}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors resize-none"
                  ></textarea>
                  {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="mb-1 block text-sm font-medium text-zinc-700">City</label>
                    <input
                      {...register("city")}
                      type="text"
                      id="city"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-zinc-700">Postal Code</label>
                    <input
                      {...register("postalCode")}
                      type="text"
                      id="postalCode"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                    />
                    {errors.postalCode && <p className="mt-1 text-sm text-red-400">{errors.postalCode.message}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-zinc-200 bg-white/50 p-4">
                <p className="text-sm text-zinc-700">Payment Method</p>
                <p className="text-lg font-medium text-zinc-900">Cash on Delivery</p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-6 text-lg bg-[#E5C98F] text-zinc-900 hover:bg-[#BD9142] shadow-[0_0_15px_rgba(219,39,119,0.3)] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-2xl border border-zinc-200 bg-white/50 p-6 md:p-8 shadow-md backdrop-blur-sm">
            <h2 className="mb-6 border-b border-zinc-200 pb-4 text-2xl font-bold text-zinc-900">Order Summary</h2>
            
            <div className="mb-6 max-h-[300px] space-y-4 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                    <Image 
                      src={item.image || "/images/gift-basket.svg"} 
                      alt={item.name} 
                      fill 
                      sizes="64px"
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-zinc-700">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-rose-600">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 pt-4 border-t border-zinc-200 text-sm">
              <div className="flex justify-between text-zinc-700">
                <span>Subtotal</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>Shipping</span>
                <span className="text-rose-600">{shippingFee === null ? "..." : shippingFee === 0 ? "Free" : `Rs. ${shippingFee.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-4 text-xl font-bold text-zinc-900">
              <span>Total</span>
              <span className="text-rose-600">Rs. {(totalPrice + (shippingFee || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
