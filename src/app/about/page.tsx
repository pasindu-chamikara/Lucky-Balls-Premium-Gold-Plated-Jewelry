"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
};

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div className="min-h-screen bg-[#FCFBF9] font-sans selection:bg-[#E5C98F]/30 text-zinc-900 overflow-hidden">
      <Navbar />

      <main className="w-full" ref={containerRef}>
        {/* 1. Full-bleed Cinematic Hero */}
        <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full">
            <video
              src="/videos/about1.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={(e) => {
                (e.target as HTMLVideoElement).playbackRate = 0.6;
              }}
              className="w-full h-full object-cover opacity-80"
            />
            {/* Light Gradient Overlay to blend with the rest of the page */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBF9] via-transparent to-black/20" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center px-6 mt-16">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="text-[10px] md:text-xs font-medium uppercase text-zinc-800 mb-6 drop-shadow-sm"
            >
              The Heritage
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl lg:text-[9rem] font-serif italic tracking-tighter leading-[1] sm:leading-[0.85] text-zinc-900 drop-shadow-sm"
            >
              Quiet <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BD9142] to-[#E5C98F]">Elegance</span>
            </motion.h1>
          </div>
        </section>

        {/* 2. Editorial Narrative Section */}
        <section className="w-full bg-[#FCFBF9] py-16 sm:py-24 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
              <motion.div
                {...fadeIn}
                className="w-full lg:w-5/12"
              >
                <h2 className="text-3xl sm:text-5xl font-serif italic text-zinc-900 leading-tight mb-8">
                  Born from a passion <br /> for beautiful things.
                </h2>
              </motion.div>

              <div className="w-full lg:w-7/12 flex flex-col gap-8">
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base sm:text-lg text-zinc-600 font-serif leading-relaxed"
                >
                  Lucky Balls was founded with a singular vision: to make premium, elegant jewellery accessible to everyone. What started as a passion project has grown into a trusted destination for those who appreciate the finer details.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm sm:text-base text-zinc-500 font-serif leading-relaxed pl-6 border-l border-[#BD9142]/30"
                >
                  We believe that true luxury isn't loud. It's found in the delicate craftsmanship, the perfect weight of a pendant, and the timeless elegance of a design that speaks for itself.
                </motion.p>
              </div>
            </div>
          </div>
        </section>


        {/* 4. The Standard (Values) - Staggered List with Video */}
        <section className="w-full py-16 sm:py-32 bg-white border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* Left Side: Content */}
              <div>
                <motion.div {...fadeIn} className="mb-16">
                  <span className="text-[#BD9142] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Our Commitment</span>
                  <h2 className="text-4xl sm:text-6xl font-serif italic text-zinc-900">The Standard</h2>
                </motion.div>

                <div className="space-y-12">
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="group relative flex flex-col sm:flex-row items-start text-left gap-6 p-6 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
                  >
                    <div className="text-[#BD9142] text-5xl font-serif italic opacity-50 group-hover:opacity-100 transition-opacity">01</div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif italic text-zinc-900 mb-3">Craftsmanship</h3>
                      <p className="text-base text-zinc-600 font-light leading-relaxed">
                        Every piece is meticulously crafted using durable materials, including premium 18K gold plating, ensuring a finish that endures beautifully over time.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="group relative flex flex-col sm:flex-row items-start text-left gap-6 p-6 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
                  >
                    <div className="text-[#BD9142] text-5xl font-serif italic opacity-50 group-hover:opacity-100 transition-opacity">02</div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif italic text-zinc-900 mb-3">Timeless Design</h3>
                      <p className="text-base text-zinc-600 font-light leading-relaxed">
                        We balance timeless elegance with modern aesthetics, creating collections that feel both fresh and eternally relevant to your personal style.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="group relative flex flex-col sm:flex-row items-start text-left gap-6 p-6 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
                  >
                    <div className="text-[#BD9142] text-5xl font-serif italic opacity-50 group-hover:opacity-100 transition-opacity">03</div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif italic text-zinc-900 mb-3">Dedicated Service</h3>
                      <p className="text-base text-zinc-600 font-light leading-relaxed">
                        From a seamless online experience to reliable, secure delivery, your satisfaction is the absolute cornerstone of our brand.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Side: Video */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden shadow-2xl"
              >
                <video
                  src="/videos/about2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5" />
              </motion.div>

            </div>
          </div>
        </section>

        {/* 5. Majestic CTA */}
        <section className="relative w-full bg-[#FCFBF9] py-32 overflow-hidden border-t border-zinc-200">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#BD9142]/5 via-[#FCFBF9] to-[#FCFBF9]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10 max-w-2xl mx-auto text-center px-6"
          >
            <h2 className="text-4xl sm:text-6xl font-serif italic text-zinc-900 mb-10">Discover the Collection</h2>
            <Link href="/shop">
              <Button size="lg" className="bg-[#E5C98F] text-zinc-900 hover:bg-[#A37B35] px-12 h-14 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-none">
                Enter Boutique
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
