import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | RAG Academy",
  description: "How RAG Academy collects, uses, and protects your data",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: January 15, 2026
        </p>

        <div className="prose prose-zinc mt-8 max-w-none">
          <h2>1. Introduction</h2>
          <p>
            RAG Academy ("we," "us," or "our") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our website and services
            at ragacademy.space.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>
              <strong>Account Information:</strong> Email address, password (hashed),
              and optional profile details (username, display name)
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely by Polar.sh;
              we do not store credit card numbers
            </li>
            <li>
              <strong>User Content:</strong> Code solutions, discussion posts, and
              challenge submissions
            </li>
            <li>
              <strong>Communications:</strong> Support requests and feedback
            </li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li>
              <strong>Usage Data:</strong> Pages visited, challenges attempted,
              time spent, and features used
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, operating system,
              and screen resolution
            </li>
            <li>
              <strong>Log Data:</strong> IP address, access times, and referring URLs
            </li>
            <li>
              <strong>Cookies:</strong> Session cookies for authentication and
              preferences (see Section 6)
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Process payments and manage subscriptions</li>
            <li>Track your learning progress and achievements</li>
            <li>Personalize your experience and recommendations</li>
            <li>Send transactional emails (receipts, password resets)</li>
            <li>Send marketing emails (if you opt in)</li>
            <li>Improve our content and features</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. How We Share Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>
              <strong>Service Providers:</strong>
              <ul>
                <li>Supabase (database and authentication)</li>
                <li>Polar.sh (payment processing)</li>
                <li>Resend (email delivery)</li>
                <li>Vercel (hosting)</li>
              </ul>
            </li>
            <li>
              <strong>Public Profiles:</strong> Username and leaderboard rankings
              may be visible to other users
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect
              our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger,
              acquisition, or sale of assets
            </li>
          </ul>
          <p>
            <strong>We do NOT sell your personal information to third parties.</strong>
          </p>

          <h2>5. Data Retention</h2>
          <p>We retain your data for as long as:</p>
          <ul>
            <li>Your account is active</li>
            <li>Needed to provide services to you</li>
            <li>Required by legal obligations</li>
          </ul>
          <p>
            Upon account deletion, your personal data will be removed within 30 days.
            Anonymized usage data may be retained for analytics.
          </p>

          <h2>6. Cookies and Tracking</h2>
          <p>We use cookies for:</p>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Authentication, security, and
              session management (required)
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remembering your settings like
              dark mode
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Understanding how you use our
              Service (optional, can be disabled)
            </li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling
            essential cookies may prevent you from using certain features.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update inaccurate information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your data
            </li>
            <li>
              <strong>Portability:</strong> Receive your data in a portable format
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from marketing emails
            </li>
            <li>
              <strong>Restrict Processing:</strong> Limit how we use your data
            </li>
          </ul>
          <p>
            To exercise these rights, contact us at privacy@ragacademy.space.
          </p>

          <h2>8. Data Security</h2>
          <p>We implement security measures including:</p>
          <ul>
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Secure password hashing</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>
          <p>
            No system is 100% secure. We cannot guarantee absolute security but
            strive to protect your data using industry-standard practices.
          </p>

          <h2>9. International Data Transfers</h2>
          <p>
            Your data may be processed in countries outside your residence. We
            ensure appropriate safeguards are in place, including:
          </p>
          <ul>
            <li>Standard contractual clauses with service providers</li>
            <li>Compliance with applicable data protection laws</li>
          </ul>

          <h2>10. Children's Privacy</h2>
          <p>
            RAG Academy is not intended for children under 13 (or 16 in the EU).
            We do not knowingly collect data from children. If we discover such
            data, we will delete it promptly.
          </p>

          <h2>11. California Privacy Rights (CCPA)</h2>
          <p>California residents have additional rights:</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to request deletion of personal information</li>
            <li>Right to opt-out of sale of personal information (we don't sell data)</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>

          <h2>12. European Privacy Rights (GDPR)</h2>
          <p>
            If you are in the European Economic Area, you have rights under GDPR
            including access, rectification, erasure, restriction, portability,
            and objection. Our legal basis for processing is:
          </p>
          <ul>
            <li>Contract performance (providing the Service)</li>
            <li>Legitimate interests (improving the Service)</li>
            <li>Consent (marketing emails)</li>
            <li>Legal obligations (tax and compliance)</li>
          </ul>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be
            posted on this page with an updated "Last updated" date. Significant
            changes will be communicated via email.
          </p>

          <h2>14. Contact Us</h2>
          <p>
            For privacy-related questions or to exercise your rights:
          </p>
          <ul>
            <li>
              <strong>Email:</strong> privacy@ragacademy.space
            </li>
            <li>
              <strong>Website:</strong> ragacademy.space
            </li>
          </ul>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
