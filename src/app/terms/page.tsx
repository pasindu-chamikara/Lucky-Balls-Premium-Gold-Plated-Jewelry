import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-zinc-500">Last Updated: July 2, 2026</p>
        </div>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">1. Overview</h2>
            <p>
              This website is operated by Lucky Balls. Throughout the site, the terms "we", "us" and "our" refer to Lucky Balls. By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">2. Online Store Terms</h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">3. Products or Services</h2>
            <p className="mb-4">
              Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy (Note: We operate on a strict No Exchange policy).
            </p>
            <p>
              We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">4. Accuracy of Billing and Account Information</h2>
            <p>
              We reserve the right to refuse any order you place with us. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made. We operate on a Cash on Delivery (COD) basis; providing inaccurate phone numbers or addresses will result in order cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">5. User Comments, Feedback and Other Submissions</h2>
            <p>
              If, at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">6. Governing Law</h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Sri Lanka.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">7. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at <a href="mailto:info@luckyballs.lk" className="text-pink-600 hover:text-pink-500 font-medium">info@luckyballs.lk</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
