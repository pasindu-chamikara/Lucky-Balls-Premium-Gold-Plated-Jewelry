import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function FAQPage() {
  const faqs = [
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes! We offer Cash on Delivery across most major locations in Sri Lanka. You can place your order online and pay when the package is delivered to your doorstep."
    },
    {
      question: "How long does shipping take?",
      answer: "Orders are typically processed within 24 hours. Delivery usually takes 2-4 business days depending on your location within Sri Lanka."
    },
    {
      question: "Is your jewellery pure gold?",
      answer: "Our products feature premium 18K gold plating over durable base metals. This allows us to offer you luxurious, high-quality styles at an accessible price point while maintaining a beautiful, long-lasting finish."
    },
    {
      question: "Do you have a physical store?",
      answer: "Currently, we operate exclusively online to bring you the best prices directly. However, we ensure all our product photos and videos on TikTok accurately represent the high quality of our items."
    },
    {
      question: "Can I exchange or return an item?",
      answer: "Please note that we have a strict 'No Exchange' policy to maintain hygiene and quality standards. We thoroughly check all items before dispatch to ensure you receive perfect pieces."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is dispatched, you will receive a status update. If you created an account during checkout, you can view your order status at any time in the 'Orders' section."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF9]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif italic tracking-tight text-zinc-900 sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, and policies.
          </p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-none border border-zinc-200 hover:border-zinc-900 transition-colors">
              <h3 className="text-lg font-serif italic text-zinc-900 mb-2">{faq.question}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Still have questions?</p>
          <a href="/contact" className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-zinc-500 underline underline-offset-4">
            Contact our support team
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
