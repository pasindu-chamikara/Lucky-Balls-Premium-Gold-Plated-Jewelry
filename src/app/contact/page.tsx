"use client";

import { useState } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      await addDoc(collection(db, "messages"), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
        status: "unread"
      });
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] font-sans selection:bg-[#E5C98F]/30 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            Have a question about a product, your order, or just want to say hi? We're here to help!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8 bg-zinc-50 p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-2xl font-semibold text-zinc-900">Get in touch</h3>
            <p className="text-zinc-600">
              Our customer service team is available during business hours to assist you with any inquiries. We aim to respond to all messages within 24 hours.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-semibold text-zinc-900 uppercase tracking-widest text-xs mb-2">Phone & WhatsApp</h4>
                  <p className="text-zinc-600"><a href="tel:0722801414" className="hover:text-rose-600 font-medium">072 280 1414</a></p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-semibold text-zinc-900 uppercase tracking-widest text-xs mb-2">Email</h4>
                  <p className="text-zinc-600"><a href="mailto:info@luckyballs.lk" className="hover:text-rose-600 font-medium">info@luckyballs.lk</a></p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-semibold text-zinc-900 uppercase tracking-widest text-xs mb-2">Location</h4>
                  <p className="text-zinc-600">Colombo, Sri Lanka</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-semibold text-zinc-900 uppercase tracking-widest text-xs mb-2">Business Hours</h4>
                  <p className="text-zinc-600">Monday - Saturday<br />9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-zinc-200">
              <a href="https://wa.me/luckyballs" target="_blank" rel="noopener noreferrer">
                <Button variant="custom" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-zinc-900 py-6 gap-2 font-semibold flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                  Message us on WhatsApp
                </Button>
              </a>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center">
            {isSuccess ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Sent!</h3>
                <p className="text-zinc-600 mb-8">
                  Thank you for reaching out. Our team will get back to you shortly.
                </p>
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="rounded-full"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-zinc-900 mb-6">Send a Message</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                    <input type="text" id="name" name="name" required className="w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder:text-zinc-400" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                    <input type="email" id="email" name="email" required className="w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder:text-zinc-400" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1">Message</label>
                    <textarea id="message" name="message" required rows={4} className="w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder:text-zinc-400" placeholder="How can we help you?"></textarea>
                  </div>
                  <Button variant="rose" type="submit" disabled={isSubmitting} className="w-full py-6">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
