import Link from "next/link";

export const metadata = {
  title: "Terms of Service | RAG Academy",
  description: "Terms and conditions for using RAG Academy",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: January 15, 2026
        </p>

        <div className="prose prose-zinc mt-8 max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using RAG Academy ("Service"), operated by RAG Academy
            ("we," "us," or "our"), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            RAG Academy is an educational platform that provides interactive lessons,
            coding challenges, and resources for learning Retrieval-Augmented
            Generation (RAG) systems. The Service includes:
          </p>
          <ul>
            <li>Interactive coding challenges with in-browser execution</li>
            <li>Educational content including lessons and playbooks</li>
            <li>Progress tracking and gamification features</li>
            <li>Community features including leaderboards and discussions</li>
          </ul>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h2>4. Subscription and Payments</h2>
          <p>
            Paid subscriptions are processed through Polar.sh, our Merchant of
            Record. By subscribing, you agree to:
          </p>
          <ul>
            <li>
              <strong>Billing:</strong> Subscriptions are billed in advance on a
              monthly or annual basis depending on your selected plan.
            </li>
            <li>
              <strong>Automatic Renewal:</strong> Subscriptions automatically renew
              unless cancelled before the renewal date.
            </li>
            <li>
              <strong>Refunds:</strong> We offer a 14-day money-back guarantee for
              new subscriptions. Refund requests after 14 days are handled on a
              case-by-case basis.
            </li>
            <li>
              <strong>Price Changes:</strong> We may change prices with 30 days
              notice. Price changes do not affect current billing periods.
            </li>
          </ul>

          <h2>5. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Share your account credentials with others</li>
            <li>Redistribute, resell, or commercially exploit our content</li>
            <li>Attempt to circumvent security measures or access restrictions</li>
            <li>Use automated systems to scrape or download content</li>
            <li>Submit malicious code through the code execution environment</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate others or misrepresent your affiliation</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on RAG Academy, including but not limited to lessons,
            challenges, code examples, graphics, and trademarks, is owned by RAG
            Academy or its licensors. You may:
          </p>
          <ul>
            <li>Access content for personal, non-commercial learning</li>
            <li>Use code snippets in your own projects with attribution</li>
          </ul>
          <p>You may NOT:</p>
          <ul>
            <li>Copy or redistribute content to others</li>
            <li>Create derivative works for commercial purposes</li>
            <li>Remove copyright or proprietary notices</li>
          </ul>

          <h2>7. User-Generated Content</h2>
          <p>
            By submitting content (solutions, discussions, contributions), you grant
            us a non-exclusive, worldwide, royalty-free license to use, display, and
            distribute your content within the Service. You retain ownership of your
            original content.
          </p>

          <h2>8. Code Execution Environment</h2>
          <p>
            Our in-browser code execution environment is provided for educational
            purposes. We are not responsible for:
          </p>
          <ul>
            <li>Code that does not execute as expected</li>
            <li>Loss of code or progress due to technical issues</li>
            <li>Any damages resulting from code you write or execute</li>
          </ul>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO
            NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR
            SECURE. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, RAG ACADEMY SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR
            USE OF THE SERVICE.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violation of
            these terms. Upon termination:
          </p>
          <ul>
            <li>Your access to the Service will be revoked</li>
            <li>Paid subscriptions will not be refunded for the current period</li>
            <li>Your user data may be deleted after 30 days</li>
          </ul>

          <h2>12. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Material changes will be
            communicated via email or prominent notice on the Service. Continued use
            after changes constitutes acceptance.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction where RAG
            Academy operates, without regard to conflict of law principles.
          </p>

          <h2>14. Contact Us</h2>
          <p>
            For questions about these terms, contact us at:
            <br />
            <strong>Email:</strong> support@ragacademy.space
          </p>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
