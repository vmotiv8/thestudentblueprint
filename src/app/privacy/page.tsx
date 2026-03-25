import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Privacy Policy - The Student Blueprint",
  description: "Privacy Policy for The Student Blueprint assessment platform",
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
              The Student Blueprint
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
          Last updated: March 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#0a192f]/70 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">1. Introduction</h2>
            <p>The Student Blueprint (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, disclose, store, and protect information when you access or use our platform, website, APIs, and associated services (collectively, the &quot;Service&quot;).</p>
            <p className="mt-3">By using the Service, you consent to the data practices described in this Privacy Policy. If you do not agree with the practices described herein, you should not use the Service. This policy applies to all users, including students, parents, agency administrators, and any other individuals who interact with the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">2. Information We Collect</h2>
            <p>We collect and process the following categories of information:</p>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">2.1 Information You Provide Directly</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, organization name, job title, and role when you create an agency or admin account.</li>
              <li><strong>Student Assessment Data:</strong> Information students provide during the assessment, including but not limited to: full name, email address, parent/guardian email, date of birth, current grade level, school name, home address, GPA and academic records, standardized test scores (PSAT, SAT, ACT, AP, IB), extracurricular activities, leadership positions, competition history, career aspirations, research experience, summer program participation, special talents and abilities, family context (parent professions, sibling information, legacy connections), financial aid needs, personality traits, personal stories and challenges, and time availability.</li>
              <li><strong>Payment Information:</strong> Billing name, billing address, and payment card details. Payment information is collected and processed directly by Stripe, our PCI-compliant payment processor. We do not store, access, or retain full credit card numbers or CVV codes on our servers.</li>
              <li><strong>Communications:</strong> Emails, support requests, feedback, and any other information you provide when contacting us.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, buttons clicked, time spent on pages, assessment completion progress, and navigation patterns.</li>
              <li><strong>Device and Browser Information:</strong> IP address, browser type and version, operating system, device type, screen resolution, language preferences, and referring URLs.</li>
              <li><strong>Log Data:</strong> Server logs including access times, error logs, API call records, and administrative action audit trails.</li>
              <li><strong>Cookies and Similar Technologies:</strong> Session cookies to maintain your login state and preferences. We use essential cookies only and do not use third-party advertising or tracking cookies.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">2.3 Information Generated by Our Service</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AI-Generated Analysis:</strong> Student archetypes, competitiveness scores, personalized roadmaps, college recommendations, career analysis, and all other outputs produced by our AI engine based on student-provided data.</li>
              <li><strong>Aggregate and De-identified Data:</strong> Anonymized, aggregated statistical data derived from user interactions and assessment results, which cannot be used to identify any individual.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Service Delivery:</strong> To provide, operate, maintain, and improve the assessment platform, generate personalized student roadmaps and recommendations, and deliver downloadable PDF reports.</li>
              <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity, and enforce access controls.</li>
              <li><strong>Payment Processing:</strong> To process payments, manage subscriptions, apply coupons, and handle billing-related communications.</li>
              <li><strong>Communications:</strong> To send transactional emails including assessment results, OTP verification codes, resume codes, invitation links, account updates, billing notifications, and report regeneration alerts. We do not send unsolicited marketing emails.</li>
              <li><strong>Customer Support:</strong> To respond to your inquiries, troubleshoot issues, and provide technical assistance.</li>
              <li><strong>Security and Fraud Prevention:</strong> To detect, investigate, and prevent fraudulent transactions, unauthorized access, abuse, and other harmful activities.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
              <li><strong>Analytics and Improvement:</strong> To analyze usage patterns, monitor platform health, and improve the quality and accuracy of our AI analysis and overall Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">4. Data Sharing and Third-Party Service Providers</h2>
            <p>We share your data with the following categories of third-party service providers, solely to operate and deliver the Service:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Supabase (Database &amp; Infrastructure):</strong> Provides PostgreSQL database hosting with row-level security, data storage, and backend infrastructure. Data is stored on servers in the United States.</li>
              <li><strong>Stripe (Payment Processing):</strong> Processes all payment transactions. Stripe is a PCI DSS Level 1 certified payment processor. Payment card data is handled directly by Stripe and is not transmitted through or stored on our servers.</li>
              <li><strong>Anthropic (AI Analysis):</strong> Student assessment data is transmitted to Anthropic&apos;s Claude API for AI-powered analysis and report generation. Data sent to Anthropic is processed in accordance with Anthropic&apos;s usage policies and is not used to train their AI models. We transmit only the data necessary to generate the analysis.</li>
              <li><strong>Resend (Email Delivery):</strong> Handles transactional email delivery including assessment results, OTP codes, and notifications. Email addresses and message content are shared with Resend solely for delivery purposes.</li>
              <li><strong>Vercel (Hosting &amp; CDN):</strong> Provides application hosting, edge network delivery, and domain management. Server-side code executes on Vercel&apos;s infrastructure.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">4.1 What We Do Not Do</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not sell, rent, lease, or trade personal information to any third party for any purpose.</li>
              <li>We do not share personal information with advertisers or ad networks.</li>
              <li>We do not use personal information for targeted advertising.</li>
              <li>We do not allow third-party service providers to use your data for their own purposes beyond providing the contracted services to us.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">4.2 Agency Access</h3>
            <p>In our multi-tenant architecture, agency administrators have access only to student data within their own organization. Agency administrators can view assessment responses, AI-generated reports, and student contact information for students enrolled under their agency. Agencies cannot access data belonging to other organizations.</p>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">4.3 Legal Disclosures</h3>
            <p>We may disclose your information if required to do so by law, regulation, legal process, or governmental request, or when we believe in good faith that disclosure is necessary to: (a) protect our rights, property, or safety; (b) protect the rights, property, or safety of our users or the public; (c) detect, prevent, or address fraud, security, or technical issues; or (d) comply with a court order, subpoena, or other legal obligation.</p>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">4.4 Business Transfers</h3>
            <p>In the event of a merger, acquisition, reorganization, bankruptcy, asset sale, or similar business transaction, your information may be transferred as part of that transaction. We will notify you via email or a prominent notice on our website before your information becomes subject to a different privacy policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">5. Data Security</h2>
            <p>We implement industry-standard technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL (HTTPS) protocols.</li>
              <li><strong>Encryption at Rest:</strong> Database records are stored on encrypted storage volumes.</li>
              <li><strong>Password Security:</strong> Account passwords are hashed using bcrypt with salt before storage. We never store plaintext passwords.</li>
              <li><strong>Access Controls:</strong> Role-based access controls (RBAC) restrict data access to authorized users. Row-level security (RLS) policies in our database enforce tenant isolation, ensuring that agencies can only access their own data.</li>
              <li><strong>Audit Logging:</strong> Administrative actions are logged for security monitoring and accountability.</li>
              <li><strong>Rate Limiting:</strong> API endpoints are rate-limited to prevent abuse, brute-force attacks, and denial-of-service attempts.</li>
              <li><strong>Secure Headers:</strong> Our application enforces security headers including HTTP Strict Transport Security (HSTS), X-Frame-Options, X-Content-Type-Options, and Content Security Policy directives.</li>
              <li><strong>Input Validation:</strong> All user inputs are validated and sanitized, including AI prompt injection protection, to prevent malicious data from being processed.</li>
            </ul>
            <p className="mt-3">While we take reasonable precautions to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, and you acknowledge that you provide your information at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">6. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> Assessment data, student records, and AI-generated reports are retained for as long as the associated account (student or agency) remains active.</li>
              <li><strong>Post-Termination:</strong> Upon account cancellation or termination, your data is retained for up to 90 days to facilitate account recovery, resolve disputes, or comply with legal obligations. After the retention period, your data will be permanently and irreversibly deleted from our primary systems.</li>
              <li><strong>Backup Systems:</strong> Data may persist in encrypted backup systems for up to an additional 30 days beyond the primary retention period, after which backups are rotated and overwritten.</li>
              <li><strong>Legal Hold:</strong> We may retain data beyond the standard retention period if required by law, regulatory requirement, or ongoing legal proceedings.</li>
              <li><strong>Aggregate Data:</strong> Anonymized, aggregate statistical data that cannot identify any individual may be retained indefinitely for analytics and service improvement purposes.</li>
              <li><strong>Email Logs:</strong> Email delivery logs (recipient, template, success/failure status) are retained for up to 12 months for troubleshooting and deliverability monitoring.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">7. Your Rights and Choices</h2>
            <p>Depending on your jurisdiction, you may have the following rights with respect to your personal information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Right of Access:</strong> You may request a copy of the personal information we hold about you.</li>
              <li><strong>Right of Correction:</strong> You may request that we correct inaccurate or incomplete personal information.</li>
              <li><strong>Right of Deletion:</strong> You may request that we delete your personal information, subject to certain exceptions (e.g., legal obligations, fraud prevention).</li>
              <li><strong>Right to Data Portability:</strong> You may request a copy of your data in a structured, commonly used, machine-readable format.</li>
              <li><strong>Right to Restrict Processing:</strong> You may request that we limit the processing of your personal information under certain circumstances.</li>
              <li><strong>Right to Object:</strong> You may object to our processing of your personal information for certain purposes.</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you may withdraw consent at any time without affecting the lawfulness of prior processing.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights.</li>
            </ul>
            <p className="mt-3">Agency administrators can manage student data (view, export, delete) through their admin dashboard. For individual requests or requests that cannot be fulfilled through the dashboard, contact us at <a href="mailto:hello@thestudentblueprint.com" className="text-[#c9a227] hover:underline">hello@thestudentblueprint.com</a>. We will respond to verified requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">8. Children&apos;s Privacy</h2>
            <p>The Service is designed for students in grades 8 through 12, which may include users under the age of 18. We take the privacy of minors seriously.</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>COPPA Compliance:</strong> We do not knowingly collect personal information from children under the age of 13 without verifiable parental consent. If you are a parent or guardian and believe your child under 13 has provided personal information to us without your consent, please contact us immediately at hello@thestudentblueprint.com, and we will take steps to delete such information.</li>
              <li><strong>Parental Involvement:</strong> We encourage parents and guardians to be involved in their children&apos;s use of the Service. The assessment allows students to provide a parent email address for notification purposes.</li>
              <li><strong>Data Minimization:</strong> We collect only the information necessary to provide the assessment and generate the student&apos;s personalized roadmap. We do not collect information beyond what is needed for the Service.</li>
              <li><strong>No Behavioral Advertising:</strong> We do not use children&apos;s personal information for behavioral advertising, profiling for commercial purposes, or any purpose unrelated to the educational Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">9. International Data Transfers</h2>
            <p>Our Service is operated from the United States, and our data is stored on servers located in the United States. If you access the Service from outside the United States, you understand and consent to the transfer, processing, and storage of your information in the United States, where data protection laws may differ from those in your jurisdiction.</p>
            <p className="mt-3">For users in the European Economic Area (EEA), United Kingdom (UK), or other jurisdictions with data transfer restrictions, we rely on standard contractual clauses and/or other lawful transfer mechanisms approved by relevant authorities to transfer data to the United States.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">10. Jurisdiction-Specific Disclosures</h2>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">10.1 California Residents (CCPA/CPRA)</h3>
            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>The right to know what personal information we collect, use, disclose, and sell (we do not sell personal information)</li>
              <li>The right to delete your personal information, subject to certain exceptions</li>
              <li>The right to opt out of the sale or sharing of personal information (not applicable — we do not sell or share personal information for cross-context behavioral advertising)</li>
              <li>The right to correct inaccurate personal information</li>
              <li>The right to limit the use and disclosure of sensitive personal information</li>
              <li>The right to non-discrimination for exercising your CCPA/CPRA rights</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at hello@thestudentblueprint.com. We will verify your identity before processing your request.</p>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">10.2 European Economic Area and United Kingdom (GDPR)</h3>
            <p>If you are located in the EEA or UK, we process your personal data under the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you have requested</li>
              <li><strong>Legitimate Interests:</strong> Processing for fraud prevention, security, and service improvement, where these interests are not overridden by your rights</li>
              <li><strong>Consent:</strong> Where we have obtained your explicit consent for specific processing activities</li>
              <li><strong>Legal Obligation:</strong> Processing necessary to comply with our legal obligations</li>
            </ul>
            <p className="mt-3">You have the right to lodge a complaint with your local data protection authority if you believe your privacy rights have been violated.</p>

            <h3 className="text-lg font-semibold text-[#0a192f] mt-6 mb-2">10.3 India (DPDPA)</h3>
            <p>If you are a resident of India, we process your personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDPA). You have the right to access, correct, and erase your personal data, as well as the right to nominate a person to exercise your rights in the event of your death or incapacity. For requests, contact us at hello@thestudentblueprint.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">11. Cookies and Tracking Technologies</h2>
            <p>We use essential cookies to maintain your session state, authentication status, and user preferences. These cookies are strictly necessary for the operation of the Service and cannot be opted out of while using the platform.</p>
            <p className="mt-3">We do not use:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Third-party advertising cookies or tracking pixels</li>
              <li>Cross-site tracking technologies</li>
              <li>Social media tracking widgets</li>
              <li>Analytics cookies that track individual user behavior across websites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">12. AI Data Processing Practices</h2>
            <p>When generating student assessments and reports, we transmit student-provided data to Anthropic&apos;s Claude AI API. The following practices govern this data processing:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Only the data necessary for analysis is transmitted; we do not send entire database records or unrelated personal information.</li>
              <li>Data sent to the AI provider is processed for the sole purpose of generating the student&apos;s assessment report and is not used to train, improve, or fine-tune AI models.</li>
              <li>We apply input sanitization and prompt injection protection to prevent manipulation of the AI analysis.</li>
              <li>AI-generated outputs are stored in our database and associated with the student&apos;s assessment record.</li>
              <li>We do not use student data for our own AI training, model development, or any purpose beyond delivering the requested Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">13. Third-Party Links</h2>
            <p>The Service may contain links to third-party websites, resources, or services that are not owned or controlled by The Student Blueprint. We are not responsible for the privacy practices, content, or security of any third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">14. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Update the &quot;Last updated&quot; date at the top of this page</li>
              <li>Notify registered users via email for material changes that affect how we use or share personal information</li>
              <li>Post a prominent notice on our website</li>
            </ul>
            <p className="mt-3">Your continued use of the Service after changes are posted constitutes your acceptance of the updated Privacy Policy. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">15. Data Protection Officer</h2>
            <p>For privacy-related questions, data access requests, complaints, or concerns, please contact our data protection team:</p>
            <p className="mt-3">
              <strong>The Student Blueprint — Privacy Team</strong><br />
              Email: <a href="mailto:hello@thestudentblueprint.com" className="text-[#c9a227] hover:underline">hello@thestudentblueprint.com</a><br />
              Website: <a href="https://thestudentblueprint.com" className="text-[#c9a227] hover:underline">thestudentblueprint.com</a>
            </p>
            <p className="mt-3">We will acknowledge your request within 5 business days and provide a substantive response within 30 days. If we need additional time, we will notify you of the reason and expected timeline.</p>
          </section>
        </div>
      </main>

      <footer className="bg-[#0a192f] py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} The Student Blueprint. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
