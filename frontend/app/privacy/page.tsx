import Link from "next/link"

export default function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground">Last updated: January 2026</p>

                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Information:</strong> Email address and encrypted password.</li>
                        <li><strong>Payment Information:</strong> We do NOT store card details. Payments are processed by Paystack or Crypto gateways. We only store transaction references.</li>
                        <li><strong>Usage Data:</strong> IP addresses and logs used for security and fraud prevention.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provision and manage your RDP instances.</li>
                        <li>Send service notifications (credentials, expiration warnings).</li>
                        <li>Prevent fraud and abuse of the platform.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
                    <p>We do not sell your data. We share necessary data with:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Infrastructure Providers:</strong> Vultr/Contabo (to provision servers).</li>
                        <li><strong>Payment Processors:</strong> Paystack (to process payments).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Security</h2>
                    <p>We use industry-standard encryption (HTTPS, bcrypt) to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
                    <p>If you have questions about this privacy policy, please contact us via the Support page in your dashboard.</p>
                </section>

                <div className="pt-8 border-t mt-8">
                    <Link href="/" className="text-primary hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
