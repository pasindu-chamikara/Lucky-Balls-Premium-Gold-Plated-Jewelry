import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">Shipping Policy</h1>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            Everything you need to know about delivery times, costs, and methods.
          </p>
        </div>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Order Processing</h2>
            <p>
              All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has been dispatched.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Domestic Shipping Rates and Estimates</h2>
            <p className="mb-2">
              We offer island-wide shipping across Sri Lanka. 
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Standard Delivery:</strong> Delivery typically takes 2-4 business days. Shipping charges for your order will be calculated and displayed at checkout.</li>
              <li><strong>Colombo Delivery:</strong> Deliveries within Colombo limits may be expedited and typically arrive within 1-2 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Payment Methods</h2>
            <p>
              We currently offer <strong>Cash on Delivery (COD)</strong> for all orders. This allows you to pay for your items securely at your doorstep when they arrive. Please ensure you have the exact amount ready to avoid delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How do I check the status of my order?</h2>
            <p className="mb-4">
              When your order has shipped, you will receive an email notification from us which will include a tracking number or delivery status update. Please allow 24 hours for the tracking information to become available. 
            </p>
            <p>
              If you haven't received your order within 5 days of receiving your shipping confirmation email, please contact us at <a href="mailto:info@luckyballs.lk" className="text-pink-600 hover:text-pink-500 font-medium">info@luckyballs.lk</a> or via WhatsApp with your name and order number, and we will look into it for you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Exchanges and Returns</h2>
            <p>
              As stated in our footer, we maintain a strict <strong>No Exchange</strong> policy to ensure the hygiene and quality of our jewellery. We thoroughly inspect all items before packaging. If an item arrives damaged due to transit, please contact us within 24 hours of delivery.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
