import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Privacy Policy - TheStudentBlueprint",
  description: "Privacy Policy for TheStudentBlueprint assessment platform",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f3] font-sans">
      <nav className="bg-[#0a192f] py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform duration-700 group-hover:rotate-[360deg]">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              TheStudentBlueprint
            </span>
          </Link>
          <Link href="/" className="text-xs text-white/50 hover:text-[#c9a227] uppercase tracking-widest font-bold transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#0a192f] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-[#0a192f]/40 uppercase tracking-widest font-bold mb-12">
          Last updated: January 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#0a192f]/70 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly when using TheStudentBlueprint platform, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Account Information:</strong> Name, email address, phone number, and organization details when you create an agency account.</li>
              <li><strong>Student Assessment Data:</strong> Academic profiles, extracurricular activities, career aspirations, and other information students provide during assessments.</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe. We do not store credit card numbers on our servers.</li>
              <li><strong>Usage Data:</strong> How you interact with our platform, including pages visited and features used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our assessment platform services.</li>
              <li>To generate personalized student roadmaps and recommendations using AI analysis.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To send transactional emails (assessment results, invitations, account updates).</li>
              <li>To provide customer support and respond to inquiries.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">3. Data Sharing & Third Parties</h2>
            <p>We share data with the following service providers to operate our platform:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Supabase:</strong> Database hosting and authentication infrastructure.</li>
              <li><strong>Stripe:</strong> Secure payment processing.</li>
              <li><strong>Google AI (Gemini):</strong> AI-powered assessment analysis. Student data is processed but not stored by Google for training purposes.</li>
              <li><strong>Resend:</strong> Transactional email delivery.</li>
            </ul>
            <p className="mt-3">We do not sell personal information to third parties. Agency partners only have access to data for students within their organization.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encrypted data transmission (TLS/SSL), hashed passwords, role-based access controls, and audit logging of administrative actions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">5. Data Retention</h2>
            <p>Assessment data is retained for as long as the associated agency account is active. Upon account cancellation, data may be retained for up to 90 days before deletion. You may request data deletion at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. Agency administrators can manage student data through their dashboard. For individual requests, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">7. Contact Us</h2>
            <p>For privacy-related questions or requests, contact us at <a href="mailto:hello@thestudentblueprint.com" className="text-[#c9a227] hover:underline">hello@thestudentblueprint.com</a>.</p>
          </section>
        </div>
      </main>

      <footer className="bg-[#0a192f] py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">
          © {new Date().getFullYear()} TheStudentBlueprint Admissions Consulting
        </div>
      </footer>
    </div>
  )
}
