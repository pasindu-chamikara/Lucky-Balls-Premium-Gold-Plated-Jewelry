import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF9] font-sans text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-zinc-500">Last Updated: July 2, 2026</p>
        </div>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed">
          <p>
            This Privacy Policy describes how Lucky Balls ("we", "us", or "our") collects, uses, and discloses your Personal Information when you visit or make a purchase from our website.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">1. Information We Collect</h2>
            <p className="mb-2">When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Device Information:</strong> Version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
              <li><strong>Order Information:</strong> Name, billing address, shipping address, email address, and phone number. (Note: We do not collect credit card information as we currently operate on a Cash on Delivery model).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We use the Order Information that we collect generally to fulfill any orders placed through the Site (including arranging for shipping and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Communicate with you;</li>
              <li>Screen our orders for potential risk or fraud; and</li>
              <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">3. Sharing Your Personal Information</h2>
            <p>
              We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Firebase to power our online store and database. We also use analytics tools (such as Facebook/Meta Pixel and TikTok Pixel) to help us understand how our customers use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">4. Your Rights</h2>
            <p>
              If you are a resident of Sri Lanka, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">5. Data Retention</h2>
            <p>
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">6. Contact Us</h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:info@luckyballs.lk" className="text-rose-600 hover:text-rose-600 font-medium">info@luckyballs.lk</a> or via our Contact page.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
