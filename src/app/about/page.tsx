import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">About Us</h1>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            Discover the story behind Lucky Balls and our commitment to providing premium, everyday luxury jewellery to Sri Lanka.
          </p>
        </div>

        <div className="space-y-8 text-zinc-600 leading-relaxed">
          <div className="my-10 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-pink-100">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent z-10" />
            <Image
              src="/logo.jpeg"
              alt="Brand Image"
              fill
              className="object-cover"
            />
          </div>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Our Story</h2>
            <p className="mb-4">
              Lucky Balls was founded with a simple yet powerful vision: to make premium, elegant jewellery accessible to everyone in Sri Lanka. What started as a passionate project on social media has quickly grown into a trusted brand known for its exceptional quality, modern designs, and unbeatable customer service.
            </p>
            <p>
              We believe that jewellery is more than just an accessory; it's a statement of confidence, a celebration of moments, and a reflection of your unique style. That's why we meticulously curate our collections to ensure every piece meets our high standards of craftsmanship and beauty.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Our Promise</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Quality Craftsmanship:</strong> We use durable materials, including premium 18K gold plating, to ensure your pieces last and shine.</li>
              <li><strong>Trendsetting Designs:</strong> Our collections are constantly updated to reflect the latest global fashion trends while maintaining timeless elegance.</li>
              <li><strong>Exceptional Service:</strong> From our seamless online shopping experience to our reliable island-wide Cash on Delivery service, your satisfaction is our top priority.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Join Our Community</h2>
            <p>
              We owe our success to our incredible community of customers who share our love for beautiful things. Follow us on TikTok and Facebook to see our latest drops, styling tips, and exclusive behind-the-scenes content.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
