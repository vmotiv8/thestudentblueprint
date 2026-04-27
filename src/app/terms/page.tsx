import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Terms of Service - The Student Blueprint",
  description: "Terms of Service for The Student Blueprint assessment platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f3] font-sans">
      <nav className="bg-[#0a192f] py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform duration-700 group-hover:rotate-[360deg]">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              The Student Blueprint
            </span>
          </Link>
          <Link href="/" className="text-xs text-white/50 hover:text-[#c9a227] uppercase tracking-widest font-bold transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#0a192f] mb-2" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Terms of Service
        </h1>
        <p className="text-sm text-[#0a192f]/40 uppercase tracking-widest font-bold mb-12">
          Last updated: March 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#0a192f]/70 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing, browsing, or using The Student Blueprint platform, website, APIs, or any associated services (collectively, the &quot;Service&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&quot;Terms&quot;), our Privacy Policy, and all applicable laws and regulations. If you do not agree to these Terms, you must immediately discontinue use of the Service.</p>
            <p className="mt-3">If you are using the Service on behalf of an organization, educational agency, school, or other entity, you represent and warrant that you have the authority to bind that entity to these Terms, and the terms &quot;you&quot; and &quot;your&quot; shall refer to both you individually and the entity you represent.</p>
            <p className="mt-3">We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of the Service after any modifications constitutes acceptance of the revised Terms. It is your responsibility to review these Terms periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">2. Eligibility</h2>
            <p>The Service is intended for users who are at least 13 years of age. If you are under 18, you represent that your parent or legal guardian has reviewed and consented to these Terms on your behalf. By using the Service, you represent and warrant that you meet these eligibility requirements.</p>
            <p className="mt-3">Agency accounts are intended for educational consulting organizations, tutoring agencies, schools, and qualified educational professionals. We reserve the right to verify the legitimacy of any agency account and to refuse service at our sole discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">3. Description of Service</h2>
            <p>The Student Blueprint provides a multi-tenant student assessment platform that enables educational consulting agencies, schools, and individual students to access AI-powered college admissions analysis, personalized roadmaps, and strategic recommendations. The Service includes, but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Comprehensive student profile assessments covering academics, extracurriculars, career aspirations, personality, and other factors</li>
              <li>AI-generated student archetypes, competitiveness scores, and personalized college admissions roadmaps</li>
              <li>Grade-by-grade academic and extracurricular planning</li>
              <li>College matching and recommendation analysis</li>
              <li>Downloadable PDF reports</li>
              <li>Agency management dashboards, white-labeling, and custom domain support</li>
              <li>API access for enterprise integrations</li>
              <li>Email notifications and communication features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">4. Account Registration and Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate, current, and complete information during registration and keep your account information updated at all times.</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials, including passwords, API keys, and session tokens.</li>
              <li>You must not share, transfer, or permit any third party to use your account credentials without prior written authorization.</li>
              <li>You are responsible for all activities that occur under your account, whether or not you have authorized such activities.</li>
              <li>You must immediately notify us at hello@thestudentblueprint.com if you become aware of any unauthorized use of your account or any other breach of security.</li>
              <li>We reserve the right to suspend or terminate any account that we reasonably believe has been compromised or is being used in violation of these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">5. Subscription Plans, Billing, and Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Subscription Billing:</strong> Agency subscription plans are billed on a recurring monthly or annual basis through Stripe, our third-party payment processor. By subscribing, you authorize us to charge your designated payment method at the beginning of each billing cycle.</li>
              <li><strong>Assessment Fees:</strong> Individual student assessment fees are set by each agency (or by The Student Blueprint for direct-to-consumer purchases) and collected through the platform via Stripe. Agencies using Stripe Connect receive payments directly to their connected accounts.</li>
              <li><strong>Free Trials:</strong> Free trial periods, when offered, automatically convert to paid subscriptions at the end of the trial period unless you cancel before the trial expires. You will be notified before any charge is applied.</li>
              <li><strong>Price Changes:</strong> We reserve the right to change subscription pricing at any time. Price changes will take effect at the start of your next billing cycle, and you will be notified in advance. Your continued use of the Service after a price change constitutes acceptance of the new pricing.</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time through the billing portal or by contacting support. Cancellation takes effect at the end of your current billing period. No partial refunds are provided for unused portions of a billing cycle.</li>
              <li><strong>Refund Policy:</strong> Assessment fees are generally non-refundable once an AI-generated report has been delivered. For subscription fees, refunds are handled on a case-by-case basis at our sole discretion. To request a refund, contact hello@thestudentblueprint.com within 14 days of the charge.</li>
              <li><strong>Failed Payments:</strong> If a payment fails, we may suspend access to the Service until the outstanding balance is resolved. We reserve the right to use third-party collection services for overdue amounts.</li>
              <li><strong>Taxes:</strong> All fees are exclusive of applicable taxes. You are responsible for paying any sales tax, value-added tax (VAT), or other taxes imposed by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">6. Coupons and Promotional Offers</h2>
            <p>From time to time, we or our agency partners may issue coupon codes or promotional offers. Coupons are subject to their stated terms, including expiration dates, usage limits, and discount types. Coupons cannot be combined, transferred, sold, or redeemed for cash. We reserve the right to void any coupon that we determine has been obtained or used fraudulently.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">7. Acceptable Use Policy</h2>
            <p>You agree that you will not, and will not permit any third party to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Use the Service for any unlawful, fraudulent, or malicious purpose</li>
              <li>Submit false, misleading, fabricated, or intentionally inaccurate student information</li>
              <li>Attempt to reverse-engineer, decompile, disassemble, or otherwise derive the source code or underlying algorithms of the Service</li>
              <li>Interfere with, disrupt, or place an undue burden on the Service or its infrastructure, including through denial-of-service attacks, automated scraping, or excessive API calls</li>
              <li>Circumvent, disable, or interfere with any security, access control, or rate-limiting features of the Service</li>
              <li>Exceed your subscription plan limits (including student counts, admin seats, or API quotas) without upgrading to an appropriate plan</li>
              <li>Share, publish, or distribute API keys, authentication tokens, or account credentials to unauthorized parties</li>
              <li>Use the AI-generated analysis, roadmaps, or recommendations as the sole or definitive basis for college admissions decisions, academic planning, or professional counseling without independent professional judgment</li>
              <li>Resell, sublicense, or redistribute access to the Service or its outputs except as expressly permitted under your subscription plan</li>
              <li>Use the Service to collect, store, or process personal information in violation of applicable data protection laws</li>
              <li>Transmit any content that is defamatory, obscene, threatening, abusive, or that infringes on any intellectual property rights</li>
              <li>Attempt prompt injection, adversarial inputs, or any manipulation of the AI analysis system to produce altered, biased, or harmful outputs</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation with any person or entity</li>
              <li>Use the Service to compete with The Student Blueprint or to build a substantially similar product or service</li>
            </ul>
            <p className="mt-3">Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account without notice or refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">8. AI-Generated Content Disclaimer</h2>
            <p>The student assessments, archetype classifications, competitiveness scores, roadmaps, college recommendations, mentor suggestions, career analysis, and all other outputs generated by our platform are powered by artificial intelligence and machine learning technologies. You expressly acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>No Guarantee of Outcomes:</strong> AI-generated content is provided for informational and supplementary guidance purposes only. It does not constitute professional educational counseling, academic advising, or admissions consulting. No representation, warranty, or guarantee is made regarding college admission, scholarship awards, academic performance, or any other educational outcome.</li>
              <li><strong>Inherent Limitations:</strong> AI models may produce inaccurate, incomplete, outdated, or contextually inappropriate recommendations. College admissions data, program availability, and institutional requirements change frequently, and our AI may not reflect the most current information.</li>
              <li><strong>Professional Judgment Required:</strong> Educational counselors, agencies, and families should exercise independent professional judgment when interpreting and acting upon AI-generated reports. The Service is designed to supplement (not replace) qualified human advice.</li>
              <li><strong>No Professional Relationship:</strong> Use of the Service does not create a counselor-client, advisor-advisee, fiduciary, or any other professional relationship between you and The Student Blueprint.</li>
              <li><strong>Mentor Recommendations:</strong> Professor and mentor suggestions included in reports are algorithmically generated and do not imply any endorsement, affiliation, or pre-existing relationship with the named individuals or institutions. Outreach to suggested mentors is conducted at your own discretion and risk.</li>
              <li><strong>Score Interpretation:</strong> Competitiveness scores and archetype classifications are relative assessments based on AI modeling and should not be interpreted as absolute measures of a student&apos;s ability, potential, or likelihood of admission to any institution.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">9. Intellectual Property</h2>
            <p>The Service, including but not limited to its software, algorithms, AI models, visual design, user interface, branding, logos, text content, documentation, and all underlying technology, is owned by The Student Blueprint and its licensors, and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>License to Agencies:</strong> Agency partners are granted a limited, non-exclusive, non-transferable, revocable license to use the Service and its white-label features solely in accordance with their active subscription plan. This license terminates immediately upon cancellation or termination of your account.</li>
              <li><strong>Student Data Ownership:</strong> Students retain ownership of their personal data and assessment responses. Agencies are granted a license to access and use student data within their organization for educational counseling purposes only.</li>
              <li><strong>AI-Generated Reports:</strong> Reports generated by the Service are licensed to the purchasing student and/or their associated agency for personal, non-commercial educational planning use. You may not commercially redistribute, publish, or resell AI-generated reports as standalone products without express written permission.</li>
              <li><strong>Feedback:</strong> Any feedback, suggestions, or ideas you provide about the Service may be used by The Student Blueprint without any obligation to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">10. White-Labeling and Custom Domains</h2>
            <p>Agency partners on qualifying subscription plans may use white-labeling features to present the Service under their own branding. You agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>White-labeling does not transfer ownership of the underlying Service, technology, or intellectual property to you.</li>
              <li>You will not misrepresent the origin of the Service or claim to have developed the underlying technology.</li>
              <li>You are solely responsible for ensuring that your branding, logos, and domain names do not infringe on any third-party intellectual property rights.</li>
              <li>We reserve the right to revoke white-labeling privileges if they are used in a manner that damages our reputation or violates these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">11. Third-Party Services and Integrations</h2>
            <p>The Service integrates with third-party services including, but not limited to, Stripe (payments), Supabase (database infrastructure), Anthropic (AI analysis), Resend (email delivery), and Vercel (hosting). Your use of the Service is subject to the terms and policies of these third-party providers. We are not responsible for the availability, accuracy, or practices of any third-party services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">12. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, VMOTIV8 BUSINESS EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, OR TIMELINESS OF ANY AI-GENERATED CONTENT, COLLEGE RECOMMENDATIONS, SCORE CALCULATIONS, OR OTHER OUTPUTS</li>
              <li>WARRANTIES THAT THE SERVICE WILL MEET YOUR SPECIFIC REQUIREMENTS OR EXPECTATIONS</li>
              <li>WARRANTIES REGARDING THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICE, INCLUDING ANY COLLEGE ADMISSION, SCHOLARSHIP, OR ACADEMIC OUTCOMES</li>
            </ul>
            <p className="mt-3">YOU ACKNOWLEDGE THAT YOU USE THE SERVICE AT YOUR OWN RISK AND THAT YOU ARE SOLELY RESPONSIBLE FOR ANY DECISIONS MADE BASED ON INFORMATION PROVIDED BY THE SERVICE.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">13. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL VMOTIV8 BUSINESS, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, CONTRACTORS, AFFILIATES, OR LICENSORS BE LIABLE FOR:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, REVENUE, GOODWILL, DATA, BUSINESS OPPORTUNITIES, OR OTHER INTANGIBLE LOSSES</li>
              <li>ANY DAMAGES ARISING FROM: (A) YOUR USE OF OR INABILITY TO USE THE SERVICE; (B) ANY AI-GENERATED CONTENT, RECOMMENDATIONS, OR OUTPUTS; (C) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA; (D) STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SERVICE; (E) COLLEGE ADMISSION OUTCOMES, ACADEMIC PERFORMANCE, OR CAREER RESULTS; OR (F) ANY OTHER MATTER RELATED TO THE SERVICE</li>
            </ul>
            <p className="mt-3">OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU PAID TO VMOTIV8 BUSINESS IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED US DOLLARS ($100).</p>
            <p className="mt-3">THESE LIMITATIONS APPLY REGARDLESS OF THE THEORY OF LIABILITY (WHETHER CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE) AND EVEN IF VMOTIV8 BUSINESS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p className="mt-3">SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">14. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless The Student Blueprint, its officers, directors, employees, agents, contractors, affiliates, and licensors from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Your use of the Service or any activities conducted through your account</li>
              <li>Your violation of these Terms, any applicable law, or any third-party rights</li>
              <li>Any content, data, or information you submit to the Service</li>
              <li>Your reliance on AI-generated content for educational, admissions, or counseling decisions</li>
              <li>Any dispute between you and a student, parent, educational institution, or other third party arising from your use of the Service</li>
              <li>Your use of white-labeling features, including any claims of trademark or intellectual property infringement related to your branding</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">15. Termination</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>By You:</strong> You may terminate your account at any time by canceling your subscription through the billing portal or by contacting support. Termination does not entitle you to a refund of any pre-paid fees.</li>
              <li><strong>By Us:</strong> We may suspend or terminate your account immediately and without prior notice if we reasonably determine that you have violated these Terms, engaged in fraudulent or abusive conduct, failed to pay outstanding fees, or if we are required to do so by law.</li>
              <li><strong>Effect of Termination:</strong> Upon termination, your right to access the Service ceases immediately. We may retain your data for up to 90 days following termination to facilitate account recovery or comply with legal obligations. After the retention period, your data may be permanently deleted.</li>
              <li><strong>Survival:</strong> Sections relating to intellectual property, limitation of liability, indemnification, dispute resolution, and any other provisions that by their nature should survive termination will continue in full force and effect after termination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">16. Dispute Resolution and Arbitration</h2>
            <p>You and The Student Blueprint agree that any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved as follows:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Informal Resolution:</strong> Before initiating any formal proceedings, you agree to contact us at hello@thestudentblueprint.com and attempt to resolve the dispute informally for at least 30 days.</li>
              <li><strong>Binding Arbitration:</strong> If informal resolution is unsuccessful, any remaining dispute shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator, in the English language, and judgment on the award may be entered in any court of competent jurisdiction.</li>
              <li><strong>Class Action Waiver:</strong> YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT AS A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. You waive any right to participate in a class action lawsuit or class-wide arbitration against The Student Blueprint.</li>
              <li><strong>Small Claims Exception:</strong> Either party may bring an individual action in small claims court for disputes within the court&apos;s jurisdictional limits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">17. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any legal action or proceeding not subject to arbitration shall be brought exclusively in the state or federal courts located in Delaware, and you consent to the personal jurisdiction of such courts.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">18. Force Majeure</h2>
            <p>The Student Blueprint shall not be liable for any failure or delay in performing its obligations under these Terms due to circumstances beyond its reasonable control, including but not limited to natural disasters, acts of government, pandemics, war, terrorism, labor disputes, power failures, internet or telecommunications outages, third-party service provider failures, or cyberattacks.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">19. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">20. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy and any applicable subscription agreement or order form, constitute the entire agreement between you and The Student Blueprint with respect to the Service and supersede all prior or contemporaneous communications, proposals, and agreements, whether oral or written.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">21. No Waiver</h2>
            <p>The failure of The Student Blueprint to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by The Student Blueprint.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">22. Assignment</h2>
            <p>You may not assign or transfer your rights or obligations under these Terms without our prior written consent. The Student Blueprint may assign its rights and obligations under these Terms without restriction, including in connection with a merger, acquisition, reorganization, or sale of assets.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a192f] mb-3">23. Contact Information</h2>
            <p>For questions, concerns, or notices regarding these Terms of Service, please contact us at:</p>
            <p className="mt-3">
              <strong>The Student Blueprint</strong><br />
              Email: <a href="mailto:hello@thestudentblueprint.com" className="text-[#c9a227] hover:underline">hello@thestudentblueprint.com</a><br />
              Website: <a href="https://thestudentblueprint.com" className="text-[#c9a227] hover:underline">thestudentblueprint.com</a>
            </p>
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
